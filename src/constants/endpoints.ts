export const ENDPOINTS = {
  LOGIN_GOOGLE: "/api/auth/social/google/login",
  SIGNUP_GOOGLE: "/api/auth/social/google/signup",
  TOKEN_REFRESH: "/api/auth/token/refresh",
  TOKEN_REVOKE: "/api/auth/token/revoke",
  KEY_VERIFY: "/api/auth/key-verify",
  USER_PROFILE: "/api/user/profile",
} as const;
