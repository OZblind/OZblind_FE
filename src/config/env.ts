export const API_BASE_URL =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (import.meta as any).env?.VITE_API_BASE_URL || "https://www.ozboard.shop";

export const ENV = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined,
  DEFAULT_PLAIN_KEY: import.meta.env.VITE_DEFAULT_PLAIN_KEY as
    | string
    | undefined,
  DEFAULT_COHORT: import.meta.env.VITE_DEFAULT_COHORT as string | undefined,
};
