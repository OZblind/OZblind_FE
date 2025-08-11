import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginWithGoogle,
  signupWithGoogle,
  getCurrentUser,
  verifyOzKey,
  revokeToken,
  type AuthPayload,
} from "@api/auth";
import { useAuthStore } from "@store/authStore";
import { queryKeys } from "@constants/queryKeys";
import { postTokenUpdate, postLogout } from "@utils/auth/sync";

type CurrentUserKey = typeof queryKeys.currentUser;

/** 현재 유저 정보 조회 */
export function useGetCurrentUserQuery(enabled = true) {
  const set = useAuthStore.getState().setFromAuthPayload;

  const query = useQuery<AuthPayload, Error, AuthPayload, CurrentUserKey>({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.data) set(query.data);
  }, [query.data, set]);

  return query;
}

/** Google 로그인 */
export function useLoginWithGoogleMutation() {
  const set = useAuthStore.getState().setFromAuthPayload;

  return useMutation<
    { status: 200; payload: AuthPayload } | { status: 404; payload: null },
    Error,
    string
  >({
    mutationFn: loginWithGoogle,
    onSuccess: (res) => {
      if (res.status === 200) {
        set(res.payload);

        // accessToken 있을 때만 string으로 좁혀서 브로드캐스트
        const { accessToken, refreshToken } = res.payload.tokens;
        if (accessToken) {
          postTokenUpdate({ accessToken, refreshToken });
        }
      }
    },
  });
}

/** Google 회원가입 */
export function useSignupWithGoogleMutation() {
  const set = useAuthStore.getState().setFromAuthPayload;

  return useMutation<AuthPayload, Error, string>({
    mutationFn: signupWithGoogle,
    onSuccess: (payload) => {
      set(payload);

      // accessToken 있을 때만 브로드캐스트
      const { accessToken, refreshToken } = payload.tokens;
      if (accessToken) {
        postTokenUpdate({ accessToken, refreshToken });
      }
    },
  });
}

/** 오즈키 검증 */
export function useVerifyOzKeyMutation() {
  return useMutation<{ ok: boolean }, Error, string>({
    mutationFn: verifyOzKey,
  });
}

/** 로그아웃 */
export function useLogoutMutation() {
  const reset = useAuthStore.getState().reset;
  const qc = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: revokeToken,
    onSettled: () => {
      // 1) 상태 초기화
      reset();
      // 2) 멀티탭에 LOGOUT 전파
      postLogout();
      // 3) 유저 캐시 삭제
      qc.removeQueries({ queryKey: queryKeys.currentUser });
    },
  });
}
