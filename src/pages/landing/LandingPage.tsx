// src/pages/landing/LandingPage.tsx
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@constants/paths";
import { getGoogleIdToken } from "@utils/google";
import { resolvePostLoginPath } from "@utils/postLogin";
import { useToastStore } from "@store/toastStore";
import { useLoginWithGoogleMutation } from "@hooks/useAuthQueries";
import { logoColor } from "@src/assets";
import { useAuthStore } from "@store/authStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const { push } = useToastStore();

  const loginMut = useLoginWithGoogleMutation();

  // 전역 상태
  const isAuthed = useAuthStore((s) => Boolean(s.tokens.accessToken));
  const isOzAuthenticated = useAuthStore((s) => s.isOzAuthenticated);

  // 이미 로그인 상태면 /auth에서 즉시 보내기
  useEffect(() => {
    if (!isAuthed) return;
    const next = resolvePostLoginPath(Boolean(isOzAuthenticated));
    navigate(next, { replace: true });
  }, [isAuthed, isOzAuthenticated, navigate]);

  const onClickGoogle = useCallback(async () => {
    try {
      const idToken = await getGoogleIdToken(); // GIS(or 테스트 util)
      console.log(idToken);
      const res = await loginMut.mutateAsync(idToken);

      if (res.status === "pending_activation") {
        // 토큰 없음 → 키 인증 페이지로 이동
        push({ message: "오즈키 인증이 필요합니다.", type: "info" });
        navigate(PATHS.KEY_VERIFY, { replace: true });
        return;
      }

      // active/activated → 훅에서 토큰 저장 완료
      push({ message: "로그인에 성공했어요.", type: "success" });
      const next = resolvePostLoginPath(true);
      navigate(next, { replace: true });
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? (e as { message?: string }).message ?? "로그인 실패"
          : "로그인 실패";
      push({ message: msg, type: "error" });
    }
  }, [loginMut, navigate, push]);

  const disabled = loginMut.isPending;

  return (
    <main className="min-h-screen bg-base-100 flex flex-col items-center justify-center gap-8 p-6">
      {/* 로고 */}
      <img src={logoColor} alt="로고" className="w-64 h-auto" />

      {/* Google 로그인 버튼 */}
      <button
        type="button"
        onClick={onClickGoogle}
        disabled={disabled}
        className="btn btn-primary w-60"
      >
        {disabled && <span className="loading loading-spinner"></span>}
        {disabled ? "처리 중..." : "Continue with Google"}
      </button>
    </main>
  );
}
