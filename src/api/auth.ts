import api, { tokenStore } from "./client";

// 서버 응답 타입들
export type GoogleStartStatus = "active" | "pending_activation" | "activated";

type ActiveResponse = {
  status: "active" | "activated";
  access: string;
  refresh: string;
  next?: string; // e.g. "/main"
};

type PendingResponse = {
  status: "pending_activation";
  next?: string; // e.g. "activate"
};

export type GoogleStartResponse = ActiveResponse | PendingResponse;

export interface ActivateResponse {
  status: "activated" | "active";
  access: string;
  refresh: string;
  next?: string;
}

/** 1) 구글 로그인 시작
 *  POST /api/auth/google/start/  (body: { id_token })
 */
export async function loginWithGoogle(
  idToken: string
): Promise<GoogleStartResponse> {
  const { data } = await api.post<GoogleStartResponse>(
    "/api/auth/google/start",
    { id_token: idToken }
  );

  // 활성화되었거나 이미 active면 토큰 저장
  if (data.status !== "pending_activation") {
    tokenStore.set(data.access, data.refresh);
  }
  return data;
}

/** 2) 키 활성화
 *  POST /api/auth/activate/ (body: { id_token, cohort_number, plain_key })
 */
export async function activateWithKey(params: {
  idToken: string;
  cohortNumber: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plainKey: any;
}): Promise<ActivateResponse> {
  const { idToken, cohortNumber, plainKey } = params;

  const { data } = await api.post<ActivateResponse>("/api/auth/activate", {
    id_token_str: idToken,
    cohort_number: cohortNumber,
    plain_key: plainKey,
  });

  // 성공 시 토큰 저장
  tokenStore.set(data.access, data.refresh);
  return data;
}

/** 3) 프로필 조회 (보호 자원)
 *  GET /api/profile/
 */
export async function getProfile() {
  const { data } = await api.get<{
    email: string;
    name?: string;
    profile_image?: string;
  }>("/api/profile");
  return data;
}

/** 4) 리프레시 (수동 호출 필요 시만. 자동 갱신은 client.ts에서 처리)
 *  POST /api/auth/token/refresh/
 */
export async function refreshAccess() {
  const refresh = tokenStore.refresh;
  const { data } = await api.post<{ access: string }>(
    "/api/auth/token/refresh",
    { refresh }
  );
  // 새 access만 갱신
  tokenStore.set(data.access, refresh);
  return data;
}

/** 5) 로그아웃 (리프레시 무효화)
 *  POST /api/auth/revoke/
 */
export async function revokeSession() {
  const refresh = tokenStore.refresh;
  if (!refresh) return;
  try {
    await api.post("/api/auth/revoke", { refresh });
  } finally {
    tokenStore.clear();
  }
}
