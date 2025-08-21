export const CHANNEL_NAME = "auth" as const;

export const STORAGE_KEYS = {
  LOGOUT: "AUTH_LOGOUT",
  TOKENS: "AUTH_TOKENS",
} as const;

export type AuthTokens = {
  expiresIn: number;
  accessToken: string;
  refreshToken?: string | null;
};

export type AuthEvent =
  | { type: "TOKEN_UPDATE"; tokens: AuthTokens }
  | { type: "LOGOUT" };
