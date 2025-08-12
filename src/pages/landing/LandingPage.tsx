import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@constants/paths";
import { getGoogleIdToken } from "@utils/google";
import { resolvePostLoginPath } from "@utils/postLogin";
import { useToastStore } from "@store/toastStore";
import {
  useLoginWithGoogleMutation,
  useSignupWithGoogleMutation,
} from "@hooks/useAuthQueries";
import ConfirmModal from "@components/commons/ConfirmModal/ConfirmModal";
import { logoColor } from "@src/assets";
import { useAuthStore } from "@store/authStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const { push } = useToastStore();

  const loginMut = useLoginWithGoogleMutation();
  const signupMut = useSignupWithGoogleMutation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  const { tokens, isOzAuthenticated } = useAuthStore();

  // 이미 로그인 상태면 /auth에서 즉시 보내기
  useEffect(() => {
    if (tokens.accessToken) {
      const next = resolvePostLoginPath(Boolean(isOzAuthenticated));
      navigate(next, { replace: true });
    }
  }, [tokens.accessToken, isOzAuthenticated, navigate]);

  const onClickGoogle = async () => {
    try {
      const idToken = await getGoogleIdToken(); // 테스트용 (GIS로 교체 예정)
      const res = await loginMut.mutateAsync(idToken);

      if (res.status === 200) {
        const next = resolvePostLoginPath(res.payload.isOzAuthenticated);
        push({ message: "로그인에 성공했어요.", type: "success" });
        navigate(next, { replace: true });
      } else if (res.status === 404) {
        setPendingIdToken(idToken);
        setConfirmOpen(true);
      }
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? ((e as { message?: string }).message ?? "로그인 실패")
          : "로그인 실패";
      push({ message: msg, type: "error" });
    }
  };

  const onConfirmSignup = async () => {
    if (!pendingIdToken) return;
    try {
      await signupMut.mutateAsync(pendingIdToken);
      push({
        message: "가입 완료! 오즈키 인증으로 이동합니다.",
        type: "success",
      });
      navigate(PATHS.KEY_VERIFY, { replace: true });
    } catch {
      push({ message: "가입에 실패했어요.", type: "error" });
    } finally {
      setConfirmOpen(false);
      setPendingIdToken(null);
    }
  };

  const onCancelSignup = () => {
    setConfirmOpen(false);
    setPendingIdToken(null);
    push({ message: "가입을 취소했어요.", type: "info" });
  };

  const disabled = loginMut.isPending || signupMut.isPending;

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

      {/* 가입 확인 모달 */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="가입되지 않은 계정입니다. 가입하시겠습니까?"
        description="Google 계정으로 회원가입을 진행합니다."
        cancelLabel="취소"
        confirmLabel="가입"
        onCancel={onCancelSignup}
        onConfirm={onConfirmSignup}
      />
    </main>
  );
}
