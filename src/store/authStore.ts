import { create } from "zustand";

export type User = {
  userId: string;
  email: string;
  name?: string;
  role?: string;
};

export type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn?: number | null;
};

const emptyTokens: Tokens = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
};

export type AuthState = {
  user: User | null;
  // isOzAuthenticated ≡ server.users.authenticated (회원 여부와 별개, 오즈키 인증 상태)
  isOzAuthenticated: boolean | null;
  tokens: Tokens;
  setFromAuthPayload: (p: {
    user?: User | null;
    tokens?: Partial<Tokens>; // null 금지, 부분 업데이트 허용
    isOzAuthenticated?: boolean | null;
  }) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isOzAuthenticated: null,
  tokens: emptyTokens,

  setFromAuthPayload: (p) =>
    set((state) => ({
      user: p.user !== undefined ? p.user : state.user,
      isOzAuthenticated:
        p.isOzAuthenticated !== undefined
          ? p.isOzAuthenticated
          : state.isOzAuthenticated,
      tokens:
        p.tokens !== undefined
          ? { ...state.tokens, ...p.tokens }
          : state.tokens,
    })),

  reset: () =>
    set({
      user: null,
      isOzAuthenticated: null,
      tokens: emptyTokens,
    }),
}));
