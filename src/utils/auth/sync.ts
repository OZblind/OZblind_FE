import { useAuthStore } from "@store/authStore";
import {
  CHANNEL_NAME,
  STORAGE_KEYS,
  type AuthEvent,
  type AuthTokens,
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

export function bootstrapAuthSync(opts?: Opts) {
  if (inited) return;
  inited = true;

  // BroadcastChannel 수신
  if (bc) {
    bc.onmessage = (ev: MessageEvent<AuthEvent>) => {
      const msg = ev.data;
      if (!msg) return;
      if (msg.type === "TOKEN_UPDATE") {
        useAuthStore.getState().setFromAuthPayload({ tokens: msg.tokens });
        opts?.onTokenUpdate?.(msg.tokens);
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
    }
    if (e.key === STORAGE_KEYS.TOKENS && e.newValue) {
      try {
        const t = JSON.parse(e.newValue) as AuthTokens;
        if (t?.accessToken) {
          useAuthStore.getState().setFromAuthPayload({ tokens: t });
          opts?.onTokenUpdate?.(t);
        }
      } catch {
        // noop
      }
    }
  });
}

export function postTokenUpdate(tokens: AuthTokens) {
  try {
    bc?.postMessage({ type: "TOKEN_UPDATE", tokens } as AuthEvent);
  } catch {
    // noop
  }
  // 폴백: 최신 토큰 미러(상시 저장은 지양이지만 폴백용으로만 사용)
  try {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
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
  // 폴백: storage 이벤트 트리거
  try {
    localStorage.setItem(STORAGE_KEYS.LOGOUT, String(Date.now()));
  } catch {
    // noop
  }
}
