import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { ENDPOINTS } from "@constants/endpoints";
import { useAuthStore } from "@store/authStore";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

/** 401 재시도 무한루프 방지를 위한 플래그를 추가한 확장 타입 */
interface RetriableConfig<D = unknown> extends InternalAxiosRequestConfig<D> {
  _retry?: boolean;
}

/**
 * headers를 항상 AxiosHeaders로 정규화합니다.
 * - Axios v1에서는 headers가 AxiosHeaders(class) 또는 일반 객체일 수 있으므로
 *   한 번 정규화해두면 이후 `.set()` API를 안정적으로 사용할 수 있습니다.
 */
function ensureAxiosHeaders(
  h: InternalAxiosRequestConfig["headers"]
): AxiosHeaders {
  return h instanceof AxiosHeaders ? h : AxiosHeaders.from(h ?? {});
}

/**
 * Authorization 헤더를 타입 안전하게 세팅합니다.
 * - headers를 새 객체로 교체하지 않고, 기존 참조에 대해 `.set()`만 호출합니다.
 *   (AxiosHeaders를 보장한 뒤 set을 쓰므로 타입/런타임 모두 안전)
 */
function applyAuthHeader(
  cfg: InternalAxiosRequestConfig | RetriableConfig,
  token: string
): void {
  cfg.headers = ensureAxiosHeaders(cfg.headers);
  (cfg.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
}

/**
 * 공용 Axios 인스턴스
 * - 이 인스턴스를 통해 모든 API를 호출하세요.
 * - withCredentials(쿠키 전략) 사용 시 주석을 해제하세요.
 */
export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true, // 쿠키 기반 인증을 쓸 경우 활성화
});

/**
 * 요청 인터셉터
 * - 전역 상태에서 accessToken을 읽어 Authorization 헤더를 자동 부착합니다.
 * - 컴포넌트 외부(인터셉터)에서는 useAuthStore.getState()로 스냅샷을 읽습니다.
 */
api.interceptors.request.use((config) => {
  const at = useAuthStore.getState().tokens.accessToken;
  if (at) applyAuthHeader(config, at);
  return config;
});

/** 현재 refresh 진행 여부 (동시 401 대비) */
let isRefreshing = false;

/**
 * refresh 진행 동안 401로 실패한 요청들을 저장해두는 큐.
 * - refresh가 성공하면 큐에 쌓인 원요청들을 새 토큰으로 재시도합니다.
 */
let pendingQueue: Array<{
  resolve: (newAccessToken: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** 큐에 쌓인 요청들을 한 번에 처리합니다. (성공: 새 토큰 전달, 실패: 에러 전달) */
const flushQueue = (error: unknown | null, token?: string) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token as string)
  );
  pendingQueue = [];
};

/**
 * 응답 인터셉터
 * - 401(Unauthorized)이면서 `_retry` 표시가 없는 경우에만 refresh를 시도합니다.
 * - 이미 다른 요청이 refresh 중이면, 큐에 넣어 완료를 기다린 뒤 원요청을 재시도합니다.
 * - refresh 성공: 전역 토큰 갱신(setFromAuthPayload) → 큐 처리 → 원요청 재시도
 * - refresh 실패: 전역 상태 reset() → 에러 전파
 */
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const response = error.response;
    const originalRequest = (error.config ?? {}) as RetriableConfig;

    // 401이고 아직 재시도 플래그가 없을 때만 처리
    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { tokens, setFromAuthPayload, reset } = useAuthStore.getState();

      // refreshToken이 없으면 갱신 불가 → 즉시 로그아웃 처리
      if (!tokens.refreshToken) {
        reset();
        return Promise.reject(error);
      }

      // 이미 refresh 진행중이면 큐에 대기 → 새 토큰 받으면 재시도
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newAccess) => {
              applyAuthHeader(originalRequest, newAccess);
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      // refresh를 담당
      try {
        isRefreshing = true;

        // refresh 호출 (이때는 공용 api가 아닌 axios 원본을 사용)
        const r = await axios.post(
          `${baseURL}${ENDPOINTS.TOKEN_REFRESH}`,
          { refreshToken: tokens.refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccess: string = r.data?.accessToken;
        const newRefresh: string = r.data?.refreshToken ?? tokens.refreshToken!;

        // 전역 토큰 병합 갱신 (부분 업데이트)
        setFromAuthPayload({
          tokens: { accessToken: newAccess, refreshToken: newRefresh },
        });

        // 대기중이던 원요청들에 새 토큰 전달
        flushQueue(null, newAccess);

        // 현재 원요청도 새 토큰으로 재시도
        applyAuthHeader(originalRequest, newAccess);
        return api(originalRequest);
      } catch (e) {
        // refresh 실패: 대기중이던 요청들 일괄 실패 처리 + 전역 상태 리셋
        flushQueue(e, undefined);
        useAuthStore.getState().reset();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    // 401 외 에러는 그대로 전달
    return Promise.reject(error);
  }
);
