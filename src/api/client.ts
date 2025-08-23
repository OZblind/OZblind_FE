import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const REFRESH_PATH = String(
  import.meta.env.VITE_API_REFRESH_PATH ?? "/api/auth/refresh"
);
/** 자동 리프레시를 건너뛸 경로들(401이어도 시도 X) */
const SKIP_REFRESH_PATTERNS = [
  REFRESH_PATH,
  "/api/auth/google/start",
  "/api/auth/activate",
  "/api/auth/logout",
];
/** 쿠키로 refresh를 주고받기 위해 반드시 true */
export const API_WITH_CREDENTIALS =
  String(import.meta.env.VITE_API_WITH_CREDENTIALS ?? "true") === "true";

/** 내부 토큰 보관 (프론트는 access만 관리) */
const tokens = (() => {
  let access = "";
  return {
    getAccess: () => access,
    setAccess: (v: string) => {
      access = v ?? "";
      try {
        localStorage.setItem("access", access);
      } catch {
        /* empty */
      }
    },
    load: () => {
      try {
        const v = localStorage.getItem("access");
        if (v) access = v;
      } catch {
        /* empty */
      }
    },
    clear: () => {
      access = "";
      try {
        localStorage.removeItem("access");
      } catch {
        /* empty */
      }
    },
  };
})();

/** 기존 import 경로/이름 호환: tokenStore
 *  - access만 의미 있음
 *  - refresh는 더이상 사용하지 않지만, 기존 코드 호환 위해 getter만 남김(빈 문자열)
 */
export const tokenStore = {
  get access() {
    return tokens.getAccess();
  },
  /** 더이상 쓰지 않음 — 항상 빈 문자열 */
  get refresh() {
    return "";
  },
  /** 기존 시그니처 유지용: refresh 인자 무시 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set(access: string, _refresh?: string) {
    tokens.setAccess(access);
  },
  setAccess(access: string) {
    tokens.setAccess(access);
  },
  clear() {
    tokens.clear();
  },
};
tokens.load();

/** 공용 Axios 인스턴스 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: API_WITH_CREDENTIALS,
});

/** 🔹리프레시용 별도 인스턴스(인터셉터 미적용: 재귀 방지/404 무한 루프 방지) */
const refreshApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: API_WITH_CREDENTIALS,
});

/** 요청마다 access 헤더 부착 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const at = tokenStore.access;
  if (at) {
    config.headers = config.headers ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config.headers as any).Authorization = `Bearer ${at}`;
  }
  return config;
});

/** 401 → refresh 시도(쿠키 기반) → 원요청 재시도 */
let refreshing: Promise<string | null> | null = null;

async function fetchNewAccess(): Promise<string | null> {
  try {
    // ⚠️ 여기서는 refreshApi 사용 (응답 인터셉터 미적용)
    const res = await refreshApi.post(REFRESH_PATH);
    const access = res.data?.access;
    if (typeof access === "string" && access) {
      tokenStore.setAccess(access);
      return access;
    }
    // access 못 받으면 갱신 실패로 간주
    return null;
  } catch (e) {
    // 404면 백엔드에 리프레시 경로가 없다는 뜻 → 자동갱신 패스
    const status = (e as AxiosError)?.response?.status;
    if (status !== 404) {
      // 그 외에는 세션 정리
      tokenStore.clear();
    }
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const resp = err.response;
    const original =
      (err.config as InternalAxiosRequestConfig & { _retry?: boolean }) ?? {};

    // 이 URL은 자동 리프레시 스킵
    const url = original?.url ?? "";
    const shouldSkip = !url
      ? false
      : SKIP_REFRESH_PATTERNS.some((p) => url.includes(p));

    // 조건: 401 + 아직 재시도 안함 + 스킵 경로 아님
    if (resp?.status === 401 && !original._retry && !shouldSkip) {
      original._retry = true;

      if (!refreshing) {
        refreshing = fetchNewAccess().finally(() => (refreshing = null));
      }
      const newAccess = await refreshing;

      if (newAccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        original.headers = original.headers ?? ({} as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (original.headers as any).Authorization = `Bearer ${newAccess}`;
        return api(original); // 원요청 재시도
      }
    }

    throw err;
  }
);

export default api;
