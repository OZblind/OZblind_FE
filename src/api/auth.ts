import axios from "axios";
import { API_CALLBACK_URL, API_SIGNUP_URL } from "../constants/oauth";

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // httpOnly 세션 쿠키 기반 인증 가정
});

export interface AuthStatus {
  isRegistered: boolean;
  isKeyVerified: boolean;
  user?: { id: number; email: string; name?: string };
}

// OAuth code → access token & 회원 상태 교환 API
export const exchangeCode = (code: string, state?: string) =>
  api.post<AuthStatus>(API_CALLBACK_URL, { code, state });

// 신규 가입 API (가입 컨펌 모달에서 사용)
export const signup = (payload: {
  nickname: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}) => api.post(API_SIGNUP_URL, payload);
