export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** ─── Token helpers ────────────────────────────────────────────────────── */
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

const getAccess = () => localStorage.getItem(ACCESS_KEY) ?? "";
const getRefresh = () => localStorage.getItem(REFRESH_KEY) ?? "";
const setAccess = (t: string) => localStorage.setItem(ACCESS_KEY, t);
const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

/** ─── Error utils ──────────────────────────────────────────────────────── */
async function toError(res: Response) {
  const text = await res.text();
  try {
    const j = JSON.parse(text);
    return new Error(`${res.status} ${res.statusText}: ${JSON.stringify(j)}`);
  } catch {
    return new Error(`${res.status} ${res.statusText}: ${text}`);
  }
}

/** ─── Refresh single-flight(동시요청 1회화) ───────────────────────────── */
let refreshingPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refresh = getRefresh();
  if (!refresh) return false;

  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return false;

  const data = await res.json().catch(() => ({}));
  const newAccess = data?.access as string | undefined;
  if (newAccess) {
    setAccess(newAccess);
    return true;
  }
  return false;
}

async function refreshToken(): Promise<boolean> {
  if (!refreshingPromise) {
    refreshingPromise = (async () => {
      try {
        const ok = await doRefresh();
        if (!ok) clearTokens(); // 리프레시 실패 시 토큰 정리
        return ok;
      } finally {
        // 다음 401에 대비해 Promise 해제
        refreshingPromise = null;
      }
    })();
  }
  return refreshingPromise;
}

// 타입: RequestInit에서 body만 걷어내고 unknown으로 재정의
type Init = Omit<RequestInit, "body"> & { body?: unknown };

/** ─── Core request ─────────────────────────────────────────────────────── */
async function request(
  input: string,
  init: Init = {},
  retry = true
): Promise<Response> {
  const rawHeaders = (init.headers as Record<string, string> | undefined) ?? {};
  const headers: Record<string, string> = { ...rawHeaders };

  // body 전처리
  let body = init.body;
  // JSON 자동 직렬화 여부 판단
  const hasExplicitCT = Object.keys(headers).some(
    (k) => k.toLowerCase() === "content-type"
  );
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
  const isURLParams =
    typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;

  const shouldJson =
    body != null &&
    !hasExplicitCT &&
    !isFormData &&
    !isBlob &&
    !isURLParams &&
    typeof body !== "string";

  if (shouldJson) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  // 토큰 주입
  const access = getAccess();
  if (access && !headers.Authorization)
    headers.Authorization = `Bearer ${access}`;

  const res = await fetch(`${API_BASE}${input}`, {
    ...init,
    headers,
    body: body as BodyInit | null | undefined, // ← 최종적으로 안전한 타입
    credentials: "include",
  });
  //===========================================================
  const cloned = res.clone();
  let debugBody = "";
  try {
    debugBody = await cloned.text();
  } catch {
    /* empty */
  }
  console.warn(
    "[HTTP]",
    init.method ?? "GET",
    `${API_BASE}${input}`,
    res.status,
    debugBody
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log("[AUTH]", (headers as any).Authorization ?? "(none)");

  if (res.status !== 401) {
    if (!res.ok) throw await toError(res);
    return res;
  }
  if (!retry) throw await toError(res);

  const ok = await refreshToken();
  if (!ok) throw await toError(res);

  return request(input, init, false);
}

/** ─── Public API ───────────────────────────────────────────────────────── */
export const http = {
  get: <T>(url: string) => request(url).then((r) => r.json() as Promise<T>),
  post: <T>(url: string, body?: unknown) =>
    request(url, { method: "POST", body }).then((r) => r.json() as Promise<T>),
  put: <T>(url: string, body?: unknown) =>
    request(url, { method: "PUT", body }).then((r) => r.json() as Promise<T>),
  patch: <T>(url: string, body?: unknown) =>
    request(url, { method: "PATCH", body }).then((r) => r.json() as Promise<T>),
  del: (url: string) =>
    request(url, { method: "DELETE" }).then(() => undefined),
};
