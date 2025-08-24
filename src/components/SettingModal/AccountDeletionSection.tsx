import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "@api/deleteAccount";
import { tokenStore } from "@api/client";
import { useToastStore } from "@store/toastStore";
import { PATHS } from "@constants/paths";
import { useLogoutMutation } from "@hooks/useAuthQueries";

interface AccountDeletionSectionProps {
  onSuccess?: () => void;
}

export function AccountDeletionSection({
  onSuccess,
}: AccountDeletionSectionProps) {
  const navigate = useNavigate();
  const logoutMut = useLogoutMutation();
  const [inputValue, setInputValue] = useState("");
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = inputValue === "회원 탈퇴";

  const handleDelete = async () => {
    if (!isValid) return;

    const idToken = tokenStore.access;
    if (!idToken) {
      setError("로그인 후에만 회원 탈퇴가 가능합니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteAccount();
      setIsConfirmVisible(false);
      tokenStore.clear(); // 탈퇴 성공 시 토큰 초기화
      if (onSuccess) onSuccess();
      navigate(PATHS.ROOT, { replace: true });
      await logoutMut.mutateAsync();
      useToastStore.getState().push({
        // toast
        message: "회원 탈퇴에 성공했어요.",
        type: "success",
        durationMs: 4000,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("회원 탈퇴 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (isWarningVisible || isConfirmVisible) {
      setIsWarningVisible(false);
      setIsConfirmVisible(false);
      setInputValue("");
      setError(null);
    } else {
      setIsWarningVisible(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pt-6 pb-4">
        <button
          className="text-gray-400 hover:text-info"
          onClick={handleToggle}
        >
          회원 탈퇴
        </button>
      </div>

      {isWarningVisible && (
        <div className="p-4 border-2 border-base-300 rounded mb-4">
          <p className="pb-2">회원 탈퇴 시</p>
          <div className="mb-2 bg-red-600/10 rounded p-2 text-red-600">
            <p>• 회원 정보와 이용·인증 기록이 모두 삭제됩니다.</p>
            <p>• 재가입 시 가입과 인증을 처음부터 진행해야 합니다.</p>
            <p>• 삭제된 정보는 복구할 수 없습니다.</p>
          </div>
          <p className="text-info pb-1">정말 그림자 속으로 떠나버리겠습니까?</p>
          <button
            onClick={() => {
              setIsConfirmVisible(true);
              setIsWarningVisible(false);
            }}
            className="w-full py-2 rounded text-white bg-primary hover:bg-secondary transition"
          >
            확인했습니다
          </button>
        </div>
      )}

      {isConfirmVisible && (
        <div className="p-4 border-2 border-base-300 rounded">
          <p className="mb-2">탈퇴를 원하시면 "회원 탈퇴"라고 입력해 주세요.</p>
          <input
            type="text"
            placeholder="회원 탈퇴"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border border-base-300 bg-base-100 rounded mb-1 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleDelete}
            disabled={!isValid || loading}
            className={`w-full py-2 rounded text-white ${
              isValid
                ? "bg-red-600 hover:bg-red-700"
                : "bg-base-300 cursor-not-allowed"
            } transition`}
          >
            {loading ? "탈퇴 처리 중..." : "회원 탈퇴"}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      )}
    </>
  );
}
