import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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

type CurrentUserKey = typeof queryKeys.currentUser;

/** 현재 유저 정보 조회 (부팅 훅 등에서 사용) */
export function useGetCurrentUserQuery(enabled = true) {
  const set = useAuthStore.getState().setFromAuthPayload;

  const query = useQuery<AuthPayload, Error, AuthPayload, CurrentUserKey>({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser, // () => Promise<AuthPayload>
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.data) set(query.data);
  }, [query.data, set]);

  return query;
}

/** Google 로그인 (idToken -> {status:200|404,...}) */
export function useLoginWithGoogleMutation() {
  const set = useAuthStore.getState().setFromAuthPayload;

  return useMutation<
    { status: 200; payload: AuthPayload } | { status: 404; payload: null },
    Error,
    string
  >({
    mutationFn: loginWithGoogle,
    onSuccess: (res) => {
      if (res.status === 200) set(res.payload);
      // 404는 호출부에서 가입 모달 등으로 분기
    },
  });
}

/** Google 회원가입 (idToken -> AuthPayload) */
export function useSignupWithGoogleMutation() {
  const set = useAuthStore.getState().setFromAuthPayload;

  return useMutation<AuthPayload, Error, string>({
    mutationFn: signupWithGoogle,
    onSuccess: (payload) => set(payload),
  });
}

/** 오즈키 검증 (key -> { ok: boolean }) */
export function useVerifyOzKeyMutation() {
  return useMutation<{ ok: boolean }, Error, string>({
    mutationFn: verifyOzKey,
  });
}

/** 로그아웃 (void -> void) */
export function useLogoutMutation() {
  const reset = useAuthStore.getState().reset;

  return useMutation<void, Error, void>({
    mutationFn: revokeToken,
    onSettled: () => {
      reset(); // 서버 실패해도 클라이언트 상태는 초기화
    },
  });
}
