// src/store/authStore.ts
import { create } from "zustand";
import { tokenStore } from "@api/client";

export type User = {
  id?: string | number;
  email?: string;
  name?: string;
  profile_image?: string; // 필요시 유지
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

type AuthState = {
  user: User | null;
  tokens: Tokens;
  isOzAuthenticated: boolean | null;

  setFromAuthPayload: (payload: SetFromAuthPayloadArg) => void;
  setUser: (user: Partial<User> | null) => void;
  setTokens: (tokens: Partial<Tokens>) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: {},
  isOzAuthenticated: null,

  setFromAuthPayload: ({ user, tokens, isOzAuthenticated }) => {
    set((state) => {
      // 1) user 병합/초기화
      const nextUser =
        user === null
          ? null
          : user
          ? { ...(state.user ?? {}), ...user }
          : state.user;

      // 2) tokens 병합
      const nextTokens =
        tokens && (tokens.accessToken || tokens.refreshToken)
          ? { ...state.tokens, ...tokens }
          : state.tokens;

      // 3) tokenStore 동기화 (부분 갱신 안전 처리)
      if (tokens) {
        const at =
          tokens.accessToken !== undefined
            ? tokens.accessToken
            : tokenStore.access;
        const rt =
          tokens.refreshToken !== undefined
            ? tokens.refreshToken
            : tokenStore.refresh;

        // 둘 다 빈 값이면 clear, 아니면 set
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
    set((state) => ({
      user: user === null ? null : { ...(state.user ?? {}), ...user },
    })),

  setTokens: (tokens) =>
    set((state) => {
      const merged = { ...state.tokens, ...tokens };
      // tokenStore 동기화
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
