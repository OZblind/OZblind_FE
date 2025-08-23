import api, { tokenStore } from "./client";

// 서버 응답 타입(기존과 최대한 호환)
export type GoogleStartStatus = "active" | "pending_activation" | "activated";

type ActiveResponse = {
  status: "active" | "activated";
  access?: string; // access만 의미 있음 (있으면 저장)
  next?: string;
};

type PendingResponse = {
  status: "pending_activation";
  next?: string;
};

export type GoogleStartResponse = ActiveResponse | PendingResponse;

/** 1) 구글 로그인 시작: id_token 검증 → access 발급(+ refresh는 쿠키)
 *  POST /api/auth/google/start
 */
export async function loginWithGoogle(
  idToken: string
): Promise<GoogleStartResponse> {
  const { data } = await api.post<GoogleStartResponse>(
    "/api/auth/google/start",
    { id_token: idToken }
  );

  // 서버가 access를 내려주면 저장 (refresh는 쿠키이므로 프론트 저장 X)
  if ("access" in data && typeof data.access === "string" && data.access) {
    tokenStore.setAccess(data.access);
  }
  return data;
}

/** 2) (선택) 활성화 키 검증: access 부여 가능
 *  POST /api/auth/activate
 */
export async function activateWithKey(key: string) {
  const { data } = await api.post<ActiveResponse>("/api/auth/activate", {
    key,
  });
  if (data?.access) tokenStore.setAccess(data.access);
  return data;
}

/** 3) 프로필 조회 (기존 사용 코드 유지) */
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

/** 4) 토큰 갱신(수동 호출이 필요할 때만; 기본은 인터셉터 자동)
 *  POST /api/auth/refresh  (쿠키 기반)
 */
export async function refreshAccessManual() {
  const { data } = await api.post<{ access: string }>("/api/auth/refresh");
  if (data?.access) tokenStore.setAccess(data.access);
  return data;
}

/** 5) 로그아웃: 서버가 refresh 쿠키 제거
 *  POST /api/auth/logout
 *  (서버에 /revoke 만 있는 경우를 대비해 fallback)
 */
export async function revokeSession() {
  try {
    // 신규(권장)
    await api.post("/api/auth/logout");
  } catch {
    // 구형(Fallback)
    try {
      await api.post("/api/auth/revoke", {}); // refresh는 쿠키에서 처리 or 서버 무시
    } catch {
      /* empty */
    }
  } finally {
    tokenStore.clear();
  }
}
