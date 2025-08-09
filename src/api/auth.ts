// 회원 인증 API(Google 로그인/회원가입, 유저 정보, 토큰 갱신·폐기)와 응답 데이터 정규화 로직을 관리하는 모듈

import { api } from "@api/client";
import { ENDPOINTS } from "@constants/endpoints";
import type { User, Tokens } from "@store/authStore";

/** 백엔드에서 내려오는 Auth 응답 데이터 타입 (정규화 전) */
interface RawAuthResponse {
  // user 객체 안에 있을 수 있는 필드
  user?: Partial<User> & {
    id?: string | number;
    email?: string;
    name?: string;
    role?: string;
    is_active?: boolean;
    isActive?: boolean;
    social_provider?: string;
    provider?: string;
  };

  // 최상위에 있을 수 있는 필드
  id?: string | number;
  userId?: string | number;
  email?: string;
  name?: string;
  role?: string;
  is_active?: boolean;
  isActive?: boolean;
  social_provider?: string;
  provider?: string;

  // 토큰 정보
  tokens?: Partial<Tokens>;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;

  // 인증 여부
  authenticated?: boolean;
  isOzAuthenticated?: boolean;
}

/** FE isOzAuthenticated ≡ backend users.authenticated (회원 여부와 별개) */
export type AuthPayload = {
  user: User;
  tokens: Tokens;
  isOzAuthenticated: boolean;
};

/** 백엔드 Auth 응답 → FE AuthPayload로 정규화 */
export const normalizeAuthResponse = (raw: RawAuthResponse): AuthPayload => ({
  user: {
    userId: String(raw?.user?.id ?? raw?.userId ?? raw?.id ?? ""),
    email: String(raw?.user?.email ?? raw?.email ?? ""),
    name: raw?.user?.name ?? raw?.name ?? undefined,
    role: raw?.user?.role ?? raw?.role ?? undefined,
    isActive:
      raw?.user?.is_active ??
      raw?.user?.isActive ??
      raw?.is_active ??
      raw?.isActive ??
      false,
    socialProvider:
      raw?.user?.social_provider ??
      raw?.user?.provider ??
      raw?.social_provider ??
      raw?.provider ??
      undefined,
  },
  tokens: {
    accessToken: raw?.tokens?.accessToken ?? raw?.accessToken ?? null,
    refreshToken: raw?.tokens?.refreshToken ?? raw?.refreshToken ?? null,
    expiresIn: raw?.tokens?.expiresIn ?? raw?.expiresIn ?? null,
  },
  isOzAuthenticated: Boolean(
    raw?.authenticated ?? raw?.isOzAuthenticated ?? false
  ),
});

/** Google 로그인 */
export const loginWithGoogle = async (
  idToken: string
): Promise<
  { status: 200; payload: AuthPayload } | { status: 404; payload: null }
> => {
  try {
    const { data } = await api.post<RawAuthResponse>(ENDPOINTS.LOGIN_GOOGLE, {
      idToken,
    });
    return { status: 200 as const, payload: normalizeAuthResponse(data) };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      (err as { response?: { status?: number } }).response?.status === 404
    ) {
      return { status: 404 as const, payload: null };
    }
    throw err;
  }
};

/** Google 회원가입 */
export const signupWithGoogle = async (
  idToken: string
): Promise<AuthPayload> => {
  const { data } = await api.post<RawAuthResponse>(ENDPOINTS.SIGNUP_GOOGLE, {
    idToken,
  });
  return normalizeAuthResponse(data);
};

/** 현재 유저 정보 조회 */
export const getCurrentUser = async (): Promise<AuthPayload> => {
  const { data } = await api.get<RawAuthResponse>(ENDPOINTS.USER_PROFILE);
  return normalizeAuthResponse(data);
};

/** OzKey 검증 */
export const verifyOzKey = async (key: string): Promise<{ ok: boolean }> => {
  const { data } = await api.post<{ ok?: boolean }>(ENDPOINTS.KEY_VERIFY, {
    key,
  });
  return { ok: Boolean(data?.ok ?? true) };
};

/** 토큰 갱신 */
export const refreshToken = async (
  refreshTokenValue: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { data } = await api.post<{
    accessToken: string;
    refreshToken?: string;
  }>(ENDPOINTS.TOKEN_REFRESH, { refreshToken: refreshTokenValue });
  return {
    accessToken: data?.accessToken,
    refreshToken: data?.refreshToken ?? refreshTokenValue,
  };
};

/** 토큰 폐기 */
export const revokeToken = async (): Promise<void> => {
  await api.post(ENDPOINTS.TOKEN_REVOKE, {});
};
