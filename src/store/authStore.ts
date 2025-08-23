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
  role?: Role;
  isActive?: boolean;
  socialProvider?: string;
};

export type Tokens = {
  accessToken?: string;
  refreshToken?: string;
  /** 초 단위 만료(선택) */
  expiresIn?: number;
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

  const roleRaw = (import.meta.env.VITE_FORCE_AUTH_ROLE ?? "USER").toString();
  const role = roleRaw.toLowerCase() as Role;

  const user: User = {
    id: import.meta.env.VITE_FORCE_AUTH_USER_ID ?? "forced-id",
    email: import.meta.env.VITE_FORCE_AUTH_EMAIL ?? "forced@example.com",
    name: import.meta.env.VITE_FORCE_AUTH_NAME ?? "개발자",
    role,
    isActive: false,
    socialProvider: "",
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

/** 유틸: undefined 제거 + 빈 문자열은 무시 */
function cleanTokens<T extends Partial<Tokens>>(t?: T): Partial<Tokens> {
  if (!t) return {};
  const out: Partial<Tokens> = {};
  if (t.accessToken && t.accessToken.trim() !== "")
    out.accessToken = t.accessToken;
  if (t.refreshToken && t.refreshToken.trim() !== "")
    out.refreshToken = t.refreshToken;
  if (typeof t.expiresIn === "number") out.expiresIn = t.expiresIn;
  return out;
}

const { user: forcedUser, isOz: forcedOz } = getForcedUserFromEnv();

export const useAuthStore = create<AuthState>((set) => ({
  user: forcedUser,
  tokens: {},
  isOzAuthenticated: forcedOz,

  setFromAuthPayload: ({ user, tokens, isOzAuthenticated }) => {
    set((state) => {
      // 1) user 병합
      const incomingUser = normalizeUser(user);
      const nextUser =
        user === null
          ? null
          : incomingUser
          ? { ...(state.user ?? {}), ...incomingUser }
          : state.user;

      // 2) tokens 병합 (undefined/빈문자열 무시)
      const cleanedIncoming = cleanTokens(tokens);
      const nextTokens =
        Object.keys(cleanedIncoming).length > 0
          ? { ...state.tokens, ...cleanedIncoming }
          : state.tokens;

      // 3) tokenStore 동기화 (부분 업데이트만 반영, 지우기는 reset에서만)
      //    access/refresh 둘 다 비어있으면 noop
      const at =
        nextTokens.accessToken ?? state.tokens.accessToken ?? tokenStore.access;
      const rt =
        nextTokens.refreshToken ??
        state.tokens.refreshToken ??
        tokenStore.refresh;

      if ((nextTokens.accessToken || nextTokens.refreshToken) && (at || rt)) {
        tokenStore.set(at ?? "", rt ?? "");
      }
      // 비정상/부분 업데이트로 인한 clear 방지: 여기서는 clear 하지 않음

      // 4) isOzAuthenticated 갱신(명시된 경우만)
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
      const cleaned = cleanTokens(tokens);
      if (Object.keys(cleaned).length === 0) {
        // 변경 사항이 없으면 그대로
        return { tokens: state.tokens };
      }
      const merged = { ...state.tokens, ...cleaned };

      // tokenStore 동기화 (clear 금지)
      const at =
        merged.accessToken ?? state.tokens.accessToken ?? tokenStore.access;

      if (at) {
        tokenStore.setAccess(at);
      }

      return { tokens: merged };
    }),

  reset: () => {
    tokenStore.clear();
    set({ user: null, tokens: {}, isOzAuthenticated: false });
  },
}));
