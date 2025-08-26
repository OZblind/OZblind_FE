/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { PATHS } from "@constants/paths";
import { useToastStore } from "@store/toastStore";
import {
  useGetCurrentUserQuery,
  useActivateWithKeyMutation,
} from "@hooks/useAuthQueries";
import { useAuthStore } from "@store/authStore";

type ErrorPayload = {
  error?: string;
  detail?: string;
  message?: string;
  status?: string;
};

function getErrorMessage(err: unknown): string {
  const ax = err as AxiosError<ErrorPayload>;
  return (
    ax?.response?.data?.error ??
    ax?.response?.data?.detail ??
    ax?.response?.data?.message ??
    ax?.message ??
    "인증 실패"
  );
}

// 안내용 패턴(옵션) — 백엔드가 최종 검증
const KEY_PATTERN = /^OZ-[A-Z0-9-]+-COHORT\d{1,3}-[A-Z]+$/i;

export function KeySection() {
  // 훅은 항상 상단에서 모두 호출 (조건부 X)
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { push } = useToastStore();
  const activateMut = useActivateWithKeyMutation(); // expects { idToken, plainKey }
  const currentUserQuery = useGetCurrentUserQuery(false);
  const alreadyVerified = useAuthStore((s) => s.isOzAuthenticated === true);

  const disabled = activateMut.isPending;
  const normalizedKey = useMemo(() => String(key ?? "").trim(), [key]);
  const canSubmit = !disabled && normalizedKey.length > 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\r?\n/g, "");
      setKey(v);
      if (error) setError("");
    },
    [error]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text");
      const cleaned = pasted.replace(/\s+/g, " ").trim();
      e.preventDefault();
      setKey(cleaned);
    },
    []
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (!canSubmit) return;

      const pendingIdtRaw = sessionStorage.getItem("oz_pending_idt");
      const pendingIdt = String(pendingIdtRaw ?? "").trim();
      if (!pendingIdt) {
        push({
          message: "인증 토큰이 없습니다. 다시 로그인 해주세요.",
          type: "error",
        });
        navigate(PATHS.AUTH, { replace: true });
        return;
      }

      // (옵션) 형식 안내만 — 하드블록은 하지 않음
      if (!KEY_PATTERN.test(normalizedKey)) {
        // setError("키 형식이 올바르지 않습니다. 예: OZ-...-COHORT11-...");
        // return;
      }

      try {
        const res = await activateMut.mutateAsync({
          idToken: pendingIdt,
          plainKey: normalizedKey,
        });

        sessionStorage.removeItem("oz_pending_idt");
        await currentUserQuery.refetch();

        push({ message: "오즈키 인증 완료!", type: "success" });

        const next = typeof res?.next === "string" ? res.next : PATHS.MAIN;
        navigate(next, { replace: true });
      } catch (err: any) {
        const status = err?.response?.data?.status;
        if (status === "no_active_key") {
          setError("해당 기수에 활성화된 키가 없습니다.");
          return;
        }
        if (status === "invalid_key") {
          setError("활성화 키가 올바르지 않습니다.");
          return;
        }
        setError(getErrorMessage(err));
      }
    },
    [activateMut, canSubmit, currentUserQuery, navigate, normalizedKey, push]
  );

  // JSX만 조건부로 분기 (훅 호출 수는 항상 동일)
  return (
    <div className="border-b border-neutral-content py-6">
      <p className="mb-2">회원 인증</p>

      {alreadyVerified ? (
        <div className="p-3 w-full bg-base-300 text-secondary rounded-md">
          이미 인증된 사용자입니다.
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} noValidate className="flex gap-2">
            <input
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              placeholder="발급받은 인증 키를 입력해 주세요. (예: OZ-...-COHORT11-...)"
              value={key}
              onChange={handleChange}
              onPaste={handlePaste}
              className="flex-1 min-w-0 bg-base-300 border border-base-200 p-2 focus:outline-none focus:border-primary rounded"
              aria-invalid={!!error}
              aria-describedby={error ? "ozkey-error" : undefined}
              disabled={disabled}
            />

            <button
              type="submit"
              className={`px-4 text-white py-2 rounded transition ${
                disabled
                  ? "btn loading"
                  : canSubmit
                  ? "bg-primary hover:bg-secondary"
                  : "bg-neutral"
              }`}
              disabled={!canSubmit}
              aria-busy={disabled}
            >
              {disabled ? "인증 중..." : "인증"}
            </button>
          </form>

          {error && (
            <p id="ozkey-error" className="text-error font-thin mt-2">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
