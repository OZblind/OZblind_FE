import { useAuthStore } from "@src/store/authStore";
import api, { tokenStore } from "./client";
import { queryClient } from "@src/main";

// 서버 응답 타입들
export type GoogleStartStatus = "active" | "pending_activation" | "activated";

type ActiveResponse = {
  status: "active" | "activated";
  access: string;
  refresh: string;
  next?: string; // e.g. "/main"
};

export type ActivateParams = {
  idToken: string;
  plainKey: string;
  cohortNumber?: number | string; // 선택값으로 변경
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

function clearAllCookies() {
  try {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
  } catch {
    /* empty */
  }
}

/** 키에서 COHORT 숫자(예: COHORT11) 추출 */
function parseCohortFromKey(raw: string): number | null {
  const key = String(raw ?? "").trim();
  // COHORT 다음에 1~3자리 숫자 (대소문자 무관)
  const m = key.match(/COHORT\s*?(\d{1,3})\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) ? n : null;
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
export async function activateWithKey(
  params: ActivateParams
): Promise<ActivateResponse> {
  const id_token_str = String(params.idToken ?? "").trim();
  const plain_key = String(params.plainKey ?? "").trim();
  if (!id_token_str)
    throw new Error("인증 토큰이 없습니다. 다시 로그인 해주세요.");
  if (!plain_key) throw new Error("인증 키를 입력하세요.");

  // 전달된 cohortNumber → 키에서 추출
  let cohort = null as number | null;
  if (
    params.cohortNumber != null &&
    String(params.cohortNumber).trim() !== ""
  ) {
    const n = Number(String(params.cohortNumber).trim());
    if (Number.isInteger(n)) cohort = n;
  }
  if (cohort == null) {
    cohort = parseCohortFromKey(plain_key);
  }
  if (cohort == null) {
    throw new Error(
      "키에서 기수(COHORT**)를 찾지 못했습니다. 예: ...-COHORT11-..."
    );
  }

  const { data, status } = await api.post<ActivateResponse>(
    "/api/auth/activate",
    {
      id_token_str,
      cohort_number: String(cohort),
      plain_key,
    }
  );

  if ((status === 200 || status === 201) && data?.access && data?.refresh) {
    tokenStore.set(data.access, data.refresh);
  }
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
 *  POST /api/auth/token/refresh
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
  try {
    if (refresh) {
      await api.post(
        "/api/auth/revoke",
        { refresh },
        { withCredentials: true }
      );
    }
  } catch {
    // 실패해도 클라 상태는 지움
  } finally {
    // 1) 토큰/스토리지
    tokenStore.clear();

    try {
      sessionStorage.clear();
    } catch {
      /* empty */
    }

    // 2) 접근 가능한 쿠키(참고: HttpOnly 쿠키는 JS로 못 지움)
    clearAllCookies();

    // 3) 전역 상태 초기화 (Zustand 등)
    useAuthStore.getState().reset?.();

    // 4) React Query 캐시 전체 제거
    queryClient.clear();

    // 5) 민감 라우트 벗어나기(선택)
    // navigate("/login"); // 라우터 환경에 맞게 사용
    // 또는 하드 리로드로 남은 메모리 상태까지 정리
    // window.location.replace("/login");
  }
}
