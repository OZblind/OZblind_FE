import { useAuthStore, type Tokens } from "@store/authStore";
import {
  CHANNEL_NAME,
  STORAGE_KEYS,
  type AuthEvent,
  type AuthTokens, // { accessToken?: string | null; refreshToken?: string | null; expiresIn?: number | null }
} from "./events";

let inited = false;
const bc =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

type Opts = {
  onLogout?: () => void;
  onTokenUpdate?: (t: AuthTokens) => void;
};

/** AuthTokens -> Partial<Tokens> (null/빈 문자열 제거) */
function toPartialTokens(src?: AuthTokens | null): Partial<Tokens> {
  const out: Partial<Tokens> = {};
  const at =
    typeof src?.accessToken === "string" && src.accessToken.trim() !== ""
      ? src.accessToken
      : undefined;
  const rt =
    typeof src?.refreshToken === "string" && src.refreshToken.trim() !== ""
      ? src.refreshToken
      : undefined;
  const ex =
    typeof src?.expiresIn === "number" && Number.isFinite(src.expiresIn)
      ? src.expiresIn
      : undefined;

  if (at) out.accessToken = at;
  if (rt) out.refreshToken = rt;
  if (typeof ex === "number") out.expiresIn = ex;
  return out;
}

/** 레거시/혼합 형태 → 표준 형태로 정규화 (빈 문자열/널 제거하여 undefined 처리) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAuthTokens(input: any): AuthTokens {
  if (!input || typeof input !== "object")
    return {
      expiresIn: 0,
      accessToken: "",
    };

  const accessToken =
    typeof input.accessToken === "string" && input.accessToken.trim() !== ""
      ? input.accessToken
      : typeof input.access === "string" && input.access.trim() !== ""
      ? input.access
      : undefined;

  const refreshToken =
    typeof input.refreshToken === "string" && input.refreshToken.trim() !== ""
      ? input.refreshToken
      : typeof input.refresh === "string" && input.refresh.trim() !== ""
      ? input.refresh
      : undefined;

  const expiresIn =
    typeof input.expiresIn === "number"
      ? input.expiresIn
      : typeof input.exp === "number"
      ? input.exp
      : undefined;

  // 반환 시 빈값은 undefined로만 돌려준다 (null/"" 없음)
  const out: AuthTokens = {
    expiresIn: 0,
    accessToken: "",
  };
  if (accessToken) out.accessToken = accessToken;
  if (refreshToken) out.refreshToken = refreshToken;
  if (typeof expiresIn === "number") out.expiresIn = expiresIn;
  return out;
}

export function bootstrapAuthSync(opts?: Opts) {
  if (inited) return;
  inited = true;

  // BroadcastChannel 수신
  if (bc) {
    bc.onmessage = (ev: MessageEvent<AuthEvent>) => {
      const msg = ev.data;
      if (!msg) return;

      if (msg.type === "TOKEN_UPDATE") {
        const norm = normalizeAuthTokens(msg.tokens);
        const cleaned = toPartialTokens(norm);
        if (Object.keys(cleaned).length > 0) {
          useAuthStore.getState().setFromAuthPayload({ tokens: cleaned });
          // 콜백에는 정규화 버전을 넘겨 일관성 유지 (원하면 msg.tokens로 바꿔도 됨)
          opts?.onTokenUpdate?.(norm);
        }
      } else if (msg.type === "LOGOUT") {
        useAuthStore.getState().reset();
        opts?.onLogout?.();
      }
    };
  }

  // storage 폴백
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.LOGOUT) {
      useAuthStore.getState().reset();
      opts?.onLogout?.();
      return;
    }
    if (e.key === STORAGE_KEYS.TOKENS && e.newValue) {
      try {
        const raw = JSON.parse(e.newValue);
        const norm = normalizeAuthTokens(raw);
        const cleaned = toPartialTokens(norm);
        if (Object.keys(cleaned).length > 0) {
          useAuthStore.getState().setFromAuthPayload({ tokens: cleaned });
          opts?.onTokenUpdate?.(norm);
        }
      } catch {
        // noop
      }
    }
  });
}

export function postTokenUpdate(tokens: AuthTokens) {
  const norm = normalizeAuthTokens(tokens);
  const cleaned = toPartialTokens(norm);
  if (Object.keys(cleaned).length === 0) return;

  try {
    // 브로드캐스트에는 정규화된 토큰을 보냄
    bc?.postMessage({ type: "TOKEN_UPDATE", tokens: norm } as AuthEvent);
  } catch {
    // noop
  }
  // 폴백: 최신 토큰 미러(항시 저장 X, 폴백용)
  try {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(norm));
  } catch {
    // noop
  }
}

export function postLogout() {
  try {
    bc?.postMessage({ type: "LOGOUT" } as AuthEvent);
  } catch {
    // noop
  }
  try {
    localStorage.setItem(STORAGE_KEYS.LOGOUT, String(Date.now()));
  } catch {
    // noop
  }
}
