import { create } from "zustand";

export type User = {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  /**
   * 서버 users.is_active → 계정 활성 여부 (미인증/정지/탈퇴 등)
   * 로그인은 성공했더라도 isActive=false면 일부/전체 기능 제한 필요
   */
  isActive?: boolean;
  /**
   * 서버 users.social_provider (e.g. 'google'). UI 표기/분기용(민감X)
   */
  socialProvider?: string;
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
  /**
   * isOzAuthenticated ≡ server.users.authenticated
   *  - 회원 여부와는 별개로, 오즈 키 인증 완료 상태를 의미함
   *  - 로그인만 된 상태: isOzAuthenticated=false → /key-verify로 유도
   */
  isOzAuthenticated: boolean | null;
  tokens: Tokens;
  setFromAuthPayload: (p: {
    user?: User | null;
    tokens?: Partial<Tokens>; // null 금지 + 토큰 정보만 부분 갱신 허용
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
