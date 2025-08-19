// src/hooks/useAuthQueries.ts
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginWithGoogle, // POST /auth/google/start (body: { id_token })
  activateWithKey, // POST /auth/activate (body: { id_token, cohort_number, plain_key })
  getProfile, // GET /profile
  revokeSession, // POST /auth/revoke/
  type GoogleStartResponse,
  type ActivateResponse,
} from "@api/auth";
import { tokenStore } from "@api/client";
import { useAuthStore } from "@store/authStore";
import type { User, Tokens } from "@store/authStore";
import { queryKeys } from "@constants/queryKeys";
import { postTokenUpdate, postLogout } from "@utils/auth/sync";

type CurrentUserKey = typeof queryKeys.currentUser;

/** JWT payload (일부만) */
interface JwtPayload {
  user_id?: string | number; // SIMPLE_JWT 기본 클레임명
  name?: string;
}

/** access 토큰에서 user_id 안전 추출 → store의 user.id 로 사용 */
function extractUserIdFromAccess(access: string): string | number | undefined {
  if (!access) return undefined;
  try {
    const [, base64Url] = access.split(".");
    if (!base64Url) return undefined;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload: JwtPayload = JSON.parse(json);
    return payload.user_id;
  } catch {
    return undefined;
  }
}

/** 스토어에 넣을 페이로드(스토어 타입 준수) */
type StorePayload = {
  user?: Partial<User> | null;
  tokens?: Partial<Tokens>;
  isOzAuthenticated?: boolean | null;
};

/** 현재 유저 정보 조회: /profile + access→user_id 추출 */
export function useGetCurrentUserQuery(enabled = true) {
  const setFromAuthPayload = useAuthStore.getState().setFromAuthPayload;

  const query = useQuery<StorePayload, Error, StorePayload, CurrentUserKey>({
    queryKey: queryKeys.currentUser,
    enabled,
    retry: false,
    queryFn: async () => {
      const p = await getProfile(); // { email, name?, profile_image? }
      const userId = extractUserIdFromAccess(tokenStore.access);

      return {
        user: {
          id: userId as User["id"] | undefined,
          email: p.email,
          name: p.name,
          // 필요 시 profile_image도 보관하려면 주석 해제
          // profile_image: p.profile_image,
        },
        tokens: {
          accessToken: tokenStore.access || undefined,
          refreshToken: tokenStore.refresh || undefined,
        },
        isOzAuthenticated: Boolean(tokenStore.access),
      };
    },
  });

  useEffect(() => {
    if (query.data) setFromAuthPayload(query.data);
  }, [query.data, setFromAuthPayload]);

  return query;
}

/** Google 로그인(id_token) */
export function useLoginWithGoogleMutation() {
  const setFromAuthPayload = useAuthStore.getState().setFromAuthPayload;
  const qc = useQueryClient();

  return useMutation<GoogleStartResponse, Error, string>({
    mutationFn: loginWithGoogle,
    onSuccess: async (res, idToken) => {
      if (res.status === "pending_activation") {
        // 🔹 KEY_VERIFY에서 쓸 id_token 임시 저장
        sessionStorage.setItem("oz_pending_idt", idToken);
        setFromAuthPayload({ isOzAuthenticated: false });
        return;
      }

      // active/activated → 토큰 저장 완료(auth.ts 내부에서 tokenStore.set 호출됨)
      postTokenUpdate({ accessToken: res.access, refreshToken: res.refresh });

      // 프로필 동기화
      const p = await getProfile();
      const userId = extractUserIdFromAccess(tokenStore.access);

      setFromAuthPayload({
        user: {
          id: userId as User["id"] | undefined,
          email: p.email,
          name: p.name,
        },
        tokens: {
          accessToken: tokenStore.access || undefined,
          refreshToken: tokenStore.refresh || undefined,
        },
        isOzAuthenticated: true,
      });

      qc.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

/** 오즈키 활성화(실사용) */
export function useActivateWithKeyMutation() {
  const setFromAuthPayload = useAuthStore.getState().setFromAuthPayload;
  const qc = useQueryClient();

  return useMutation<
    ActivateResponse,
    Error,
    { idToken: string; cohortNumber: number; plainKey: string }
  >({
    mutationFn: activateWithKey,
    onSuccess: async (res) => {
      // 토큰 브로드캐스트
      postTokenUpdate({ accessToken: res.access, refreshToken: res.refresh });

      // 프로필 동기화
      const p = await getProfile();
      const userId = extractUserIdFromAccess(tokenStore.access);

      setFromAuthPayload({
        user: {
          id: userId as User["id"] | undefined,
          email: p.email,
          name: p.name,
        },
        tokens: {
          accessToken: tokenStore.access || undefined,
          refreshToken: tokenStore.refresh || undefined,
        },
        isOzAuthenticated: true,
      });

      qc.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

/** 오즈키 인증(DEV 목) — AppRouter의 KeyVerifyPlaceholder와 호환되도록 string만 받음 */
export function useVerifyOzKeyMutation() {
  return useMutation<{ ok: boolean }, Error, string>({
    // 실제 백엔드 활성화가 필요하면 useActivateWithKeyMutation을 사용하세요.
    mutationFn: async (plainKey: string) => {
      // DEV: "666"이면 통과, 그 외 실패 (AppRouter에 있는 플레이스홀더와 맞춤)
      const ok = plainKey.trim() === "666";
      return { ok };
    },
  });
}

/** 로그아웃 */
export function useLogoutMutation() {
  const reset = useAuthStore.getState().reset;
  const qc = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: revokeSession,
    onSettled: () => {
      reset();
      postLogout();
      qc.removeQueries({ queryKey: queryKeys.currentUser });
    },
  });
}
