import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { PATHS } from "@constants/paths";
import { useToastStore } from "@store/toastStore";
import {
  useGetCurrentUserQuery,
  useActivateWithKeyMutation,
} from "@hooks/useAuthQueries";
import { useAuthStore } from "@store/authStore";

function getErrorMessage(err: unknown): string {
  const ax = err as AxiosError<{
    error?: string;
    detail?: string;
    message?: string;
  }>;
  return (
    ax?.response?.data?.error ??
    ax?.response?.data?.detail ??
    ax?.response?.data?.message ??
    ax?.message ??
    "인증 실패"
  );
}

export function KeySection() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { push } = useToastStore();

  const activateMut = useActivateWithKeyMutation();
  const currentUserQuery = useGetCurrentUserQuery(false);

  const alreadyVerified = useAuthStore((s) => s.isOzAuthenticated === true);

  const cohortNumber = Number(import.meta.env.VITE_COHORT_NUMBER);

  if (alreadyVerified) {
    return (
      <div className="border-b border-neutral-content py-6">
        <p className="mb-2">회원 인증</p>
        <div className="p-3 w-full bg-base-300 text-secondary rounded-md">
          이미 인증된 사용자입니다.
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const pendingIdt = sessionStorage.getItem("oz_pending_idt");
    if (!pendingIdt) {
      push({
        message: "인증 토큰이 없습니다. 다시 로그인 해주세요.",
        type: "error",
      });
      navigate(PATHS.AUTH, { replace: true });
      return;
    }

    try {
      const res = await activateMut.mutateAsync({
        idToken: pendingIdt,
        cohortNumber,
        plainKey: key,
      });

      sessionStorage.removeItem("oz_pending_idt");
      await currentUserQuery.refetch();

      push({ message: "오즈키 인증 완료!", type: "success" });

      const next = typeof res?.next === "string" ? res.next : PATHS.MAIN;
      navigate(next, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  }

  const disabled = activateMut.isPending;

  return (
    <div className="border-b border-neutral-content py-6">
      <p className="mb-2">회원 인증</p>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="발급받은 인증 키를 입력해 주세요."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="flex-1 min-w-0 bg-base-300 border border-base-200 p-2 focus:outline-none focus:border-primary rounded"
          disabled={disabled}
        />
        <button
          type="submit"
          className={`px-4 text-white py-2 rounded transition ${disabled ? "btn loading" : "bg-primary hover:bg-secondary"}`}
          disabled={disabled}
        >
          {disabled ? "인증 중..." : "인증"}
        </button>
      </form>
      {error && <p className="text-error font-thin mt-2">{error}</p>}
    </div>
  );
}
