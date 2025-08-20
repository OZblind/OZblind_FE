import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

/** 토큰 저장 유틸 */
interface TokenStore {
  readonly access: string;
  readonly refresh: string;
  setAccess(v: string): void;
  setRefresh(v: string): void;
  clear(): void;
}
const tokens: TokenStore = {
  get access() {
    return localStorage.getItem("access") ?? "";
  },
  get refresh() {
    return localStorage.getItem("refresh") ?? "";
  },
  setAccess(v: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    v ? localStorage.setItem("access", v) : localStorage.removeItem("access");
  },
  setRefresh(v: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    v ? localStorage.setItem("refresh", v) : localStorage.removeItem("refresh");
  },
  clear() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  },
};

/** 401 재시도 플래그를 위한 확장 타입 */
interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/** 공용 인스턴스 */
export const api: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 15_000,
});

/** AxiosHeaders.from의 1번째 파라미터 타입을 그대로 추출 (any 불가피성 제거) */
type AxiosHeadersFromArg = Parameters<typeof AxiosHeaders.from>[0];

/** headers를 AxiosHeaders로 보장하고 키/값을 설정 */
function ensureHeaders(config: AxiosRequestConfig): AxiosHeaders {
  const current = config.headers;
  if (current instanceof AxiosHeaders) {
    return current;
  }
  const next =
    current != null
      ? AxiosHeaders.from(current as AxiosHeadersFromArg)
      : new AxiosHeaders();
  config.headers = next;
  return next;
}

function setHeader(config: AxiosRequestConfig, key: string, value: string) {
  const h = ensureHeaders(config);
  h.set(key, value);
}

/** ----- 요청 인터셉터: Authorization 자동 부착 ----- */
api.interceptors.request.use((config) => {
  const url = String(config.url ?? "");

  // 다음 경로에는 Authorization 헤더를 붙이지 않는다
  const skipAuthHeader =
    url.includes("/auth/google/start") ||
    url.includes("/auth/activate") ||
    url.includes("/auth/token/refresh/") ||
    url.includes("/auth/revoke/");

  if (!skipAuthHeader && tokens.access) {
    setHeader(config, "Authorization", `Bearer ${tokens.access}`);
  }
  return config;
});

/** ----- 401 자동 리프레시 동시성 제어 ----- */
let isRefreshing = false;
type QueueEntry = { resolve: () => void; reject: (err: unknown) => void };
let queue: QueueEntry[] = [];

function subscribeRefresh(entry: QueueEntry) {
  queue.push(entry);
}
function resolveQueue() {
  queue.forEach((q) => q.resolve());
  queue = [];
}
function rejectQueue(err: unknown) {
  queue.forEach((q) => q.reject(err));
  queue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refresh = tokens.refresh;
  if (!refresh) throw new Error("NO_REFRESH_TOKEN");
  // 기본 axios로 호출해 인터셉터 재귀 방지
  const { data } = await axios.post<{ access: string }>(
    "/api/auth/token/refresh/",
    { refresh }
  );
  tokens.setAccess(data.access);
  return data.access;
}

/** ----- 응답 인터셉터: 401 한 번만 재시도 ----- */
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetryableConfig | undefined;

    if (!status || !original) throw error;

    const isRefreshCall =
      typeof original.url === "string" &&
      original.url.includes("/auth/token/refresh/");

    if (status === 401 && !isRefreshCall && !original._retry) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newAccess = await refreshAccessToken();
          isRefreshing = false;
          resolveQueue();

          setHeader(original, "Authorization", `Bearer ${newAccess}`);
          return api.request(original);
        } catch (e) {
          isRefreshing = false;
          tokens.clear();
          rejectQueue(e);
          throw e;
        }
      }

      // 이미 다른 요청이 리프레시 중이면 대기 후 재시도
      await new Promise<void>((resolve, reject) =>
        subscribeRefresh({ resolve, reject })
      );
      setHeader(original, "Authorization", `Bearer ${tokens.access}`);
      return api.request(original);
    }

    throw error;
  }
);

/** 외부에서 토큰 접근/초기화 */
export const tokenStore = {
  get access() {
    return tokens.access;
  },
  get refresh() {
    return tokens.refresh;
  },
  set(access: string, refresh: string) {
    tokens.setAccess(access);
    tokens.setRefresh(refresh);
  },
  clear() {
    tokens.clear();
  },
};

export default api;
