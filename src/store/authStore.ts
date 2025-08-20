// src/store/authStore.ts
import { create } from "zustand";
import { tokenStore } from "@api/client";

/** 역할 타입(소문자 기준으로 정규화) */
export type Role = "admin" | "moderator" | "user";

export type User = {
  id?: string | number;
  email?: string;
  name?: string;
  profile_image?: string;
  role?: Role; // ← 추가
};

export type Tokens = {
  accessToken?: string;
  refreshToken?: string;
};

type SetFromAuthPayloadArg = {
  user?: Partial<User> | null;
  tokens?: Partial<Tokens>;
  isOzAuthenticated?: boolean | null;
};

export type AuthState = {
  user: User | null;
  tokens: Tokens;
  isOzAuthenticated: boolean | null;

  setFromAuthPayload: (payload: SetFromAuthPayloadArg) => void;
  setUser: (user: Partial<User> | null) => void;
  setTokens: (tokens: Partial<Tokens>) => void;
  reset: () => void;
};

/** .env 값 → 강제 사용자 초기값 생성 */
function getForcedUserFromEnv(): { user: User | null; isOz: boolean | null } {
  const force = import.meta.env.VITE_FORCE_AUTH === "true";
  if (!force) return { user: null, isOz: null };

  // role은 소문자로 정규화하여 Role에 맞추기
  const roleRaw = (import.meta.env.VITE_FORCE_AUTH_ROLE ?? "USER").toString();
  const role = roleRaw.toLowerCase() as Role;

  const user: User = {
    id: import.meta.env.VITE_FORCE_AUTH_USER_ID ?? "forced-id",
    email: import.meta.env.VITE_FORCE_AUTH_EMAIL ?? "forced@example.com",
    name: import.meta.env.VITE_FORCE_AUTH_NAME ?? "개발자",
    role, // ← 여기 중요
  };

  const isOz = (() => {
    const v = import.meta.env.VITE_FORCE_AUTH_OZKEY;
    if (v === undefined || v === null) return null;
    return String(v) === "true";
  })();

  return { user, isOz };
}

/** user 병합 시 role을 소문자로 정규화 */
function normalizeUser(
  u: Partial<User> | null | undefined
): Partial<User> | null | undefined {
  if (!u) return u;
  const next: Partial<User> = { ...u };
  if (next.role) next.role = next.role.toLowerCase() as Role;
  return next;
}

const { user: forcedUser, isOz: forcedOz } = getForcedUserFromEnv();

export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태: .env로 강제 로그인(있으면) + 토큰은 비워둠
  user: forcedUser,
  tokens: {},
  isOzAuthenticated: forcedOz,

  setFromAuthPayload: ({ user, tokens, isOzAuthenticated }) => {
    set((state) => {
      // 1) user 병합/초기화 (role 정규화)
      const incomingUser = normalizeUser(user);
      const nextUser =
        user === null
          ? null
          : incomingUser
          ? { ...(state.user ?? {}), ...incomingUser }
          : state.user;

      // 2) tokens 병합
      const nextTokens =
        tokens && (tokens.accessToken || tokens.refreshToken)
          ? { ...state.tokens, ...tokens }
          : state.tokens;

      // 3) tokenStore 동기화
      if (tokens) {
        const at =
          tokens.accessToken !== undefined
            ? tokens.accessToken
            : tokenStore.access;
        const rt =
          tokens.refreshToken !== undefined
            ? tokens.refreshToken
            : tokenStore.refresh;

        if (!at && !rt) tokenStore.clear();
        else tokenStore.set(at ?? "", rt ?? "");
      }

      // 4) isOzAuthenticated 갱신(명시된 경우에만)
      const nextIsOz =
        isOzAuthenticated !== undefined
          ? isOzAuthenticated
          : state.isOzAuthenticated;

      return {
        user: nextUser,
        tokens: nextTokens,
        isOzAuthenticated: nextIsOz,
      };
    });
  },

  setUser: (user) =>
    set((state) => {
      const incomingUser = normalizeUser(user);
      return {
        user: user === null ? null : { ...(state.user ?? {}), ...incomingUser },
      };
    }),

  setTokens: (tokens) =>
    set((state) => {
      const merged = { ...state.tokens, ...tokens };

      const at =
        tokens.accessToken !== undefined
          ? tokens.accessToken
          : tokenStore.access;
      const rt =
        tokens.refreshToken !== undefined
          ? tokens.refreshToken
          : tokenStore.refresh;

      if (!at && !rt) tokenStore.clear();
      else tokenStore.set(at ?? "", rt ?? "");

      return { tokens: merged };
    }),

  reset: () => {
    tokenStore.clear();
    set({ user: null, tokens: {}, isOzAuthenticated: false });
  },
}));
