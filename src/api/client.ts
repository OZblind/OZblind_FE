import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://api.ozboard.shop";

const API_WITH_CREDENTIALS =
  String(import.meta.env.VITE_API_WITH_CREDENTIALS ?? "false") === "true";

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
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: API_WITH_CREDENTIALS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/** 인터셉터 미적용 "순수" 인스턴스 (리프레시 전용) */
const raw: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: API_WITH_CREDENTIALS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
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
    url.includes("/auth/token/refresh") ||
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
  // 절대 URL(= baseURL 붙은 전용 raw 인스턴스)로 호출해야 프록시 제거 후에도 정상 동작
  const { data } = await raw.post<{ access: string }>(
    "/api/auth/token/refresh",
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
      original.url.includes("/auth/token/refresh");

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
  _csrfToken: "",
  get csrfToken() {
    return this._csrfToken;
  },
  set(access: string, refresh: string, csrfToken?: string) {
    tokens.setAccess(access);
    tokens.setRefresh(refresh);
    if (csrfToken) this._csrfToken = csrfToken;
  },
  clear() {
    tokens.clear();
    this._csrfToken = "";
  },
};

export default api;
