import { useAuthStore, type User, type Tokens } from "@store/authStore";

export function forceAuth() {
  const devUser: User = {
    id: import.meta.env.VITE_FORCE_AUTH_USER_ID ?? "dev-user-id",
    email: import.meta.env.VITE_FORCE_AUTH_EMAIL ?? "dev@oz.com",
    name: import.meta.env.VITE_FORCE_AUTH_NAME ?? "개발자",
    role: import.meta.env.VITE_FORCE_AUTH_ROLE ?? "USER",
    isActive: true,
    socialProvider: "google",
  };

  // NOTE: expiresIn 단위는 프로젝트 규칙에 맞춰(초/밀리초) 맞춰줘.
  const tokens: Tokens = {
    accessToken: "dev.access.token",
    refreshToken: "dev.refresh.token",
    expiresIn: 60 * 60 * 24, // 예: 24시간(초 단위 가정)
  };

  useAuthStore.getState().setFromAuthPayload({
    user: devUser,
    tokens,
    isOzAuthenticated:
      (import.meta.env.VITE_FORCE_AUTH_OZKEY ?? "true") === "true",
  });

  // 인터셉터가 localStorage를 직접 읽는다면 맞춰서 저장하게
  try {
    localStorage.setItem("oz_tokens", JSON.stringify(tokens));
  } catch {
    // noop
  }

  // 멀티탭 동기화
  try {
    const bc = new BroadcastChannel("auth");
    bc.postMessage({ type: "TOKEN_UPDATE" });
  } catch {
    // noop
  }
}
