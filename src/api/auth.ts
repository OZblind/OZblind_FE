import axios from "axios";
import {
  API_BASE_URL,
  API_GOOGLE_LOGIN,
  API_GOOGLE_SIGNUP,
  API_TOKEN_REFRESH,
  API_TOKEN_REVOKE,
} from "@/constants/oauth";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // 토큰 바디/헤더로 주고받는 구조라 기본은 false
  headers: { "Content-Type": "application/json" },
});

/** 백엔드 임시 명세(완성 전): 로그인/가입 공통 응답 */
export type RawAuthData = {
  userId: string;
  email: string;
  name?: string;
  role: string; // users.role
  apiKey?: string; // 가입 시 최초 발급 가능
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  authenticated?: boolean; // users.authenticated (있으면 최우선 사용)
};
export type RawAuthResponse = { status: "success"; data: RawAuthData };

/** 프론트 표준 스키마 */
export type AuthPayload = {
  user: { userId: string; email: string; name?: string; role: string };
  apiKey: string | null;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isKeyVerified: boolean; // = users.authenticated
};

/** 어댑터: 백엔드 응답 → 프론트 표준 */
export function normalizeAuthResponse(raw: RawAuthResponse): AuthPayload {
  const d = raw.data;
  const isVerified =
    typeof d.authenticated === "boolean" ? d.authenticated : Boolean(d.apiKey); // 임시 휴리스틱

  return {
    user: { userId: d.userId, email: d.email, name: d.name, role: d.role },
    apiKey: d.apiKey ?? null,
    accessToken: d.accessToken,
    refreshToken: d.refreshToken,
    expiresIn: d.expiresIn,
    isKeyVerified: isVerified,
  };
}

/** 엔드포인트들 */
export const googleLogin = (idToken: string) =>
  api.post<RawAuthResponse>(API_GOOGLE_LOGIN, { idToken });

export const googleSignup = (idToken: string) =>
  api.post<RawAuthResponse>(API_GOOGLE_SIGNUP, { idToken });

export const refreshToken = (refreshToken: string) =>
  api.post<{
    status: "success";
    data: { accessToken: string; expiresIn: number };
  }>(API_TOKEN_REFRESH, { refreshToken });

export const revokeToken = (refreshToken: string) =>
  api.post<{ status: "success"; message: string }>(API_TOKEN_REVOKE, {
    refreshToken,
  });
