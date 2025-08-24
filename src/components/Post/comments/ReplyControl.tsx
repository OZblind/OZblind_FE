import { useState } from "react";
import { MessageSquare } from "lucide-react";
import clsx from "clsx";

type ReplyControlProps = {
  depth: number; // 0이면 textarea, 그 외 input
  onSubmit: (content: string) => void | Promise<void>;
  disabled?: boolean; // 상위에서 전체 잠그고 싶을 때
  buttonLabel?: string; // 기본: "답글 작성"
  placeholder?: string; // 기본: "답글을 입력하세요"
};

export default function ReplyControl({
  depth,
  onSubmit,
  disabled = false,
  buttonLabel = "답글 작성",
  placeholder = "답글을 입력하세요",
}: ReplyControlProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePost = async () => {
    const trimmed = draft.trim();
    if (!trimmed || busy || disabled) return;

    setBusy(true);
    try {
      await onSubmit(trimmed);
      // 성공 시 초기화
      setDraft("");
      setOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // 필요 시 상위에서 토스트 처리. 여기서는 조용히 로그만.
      // console.debug("[ReplyControl] submit fail", e);
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handlePost();
    }
  };

  return (
    <>
      {/* 액션 바 안: 버튼만 인라인 */}
      <div className="inline-flex">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => !disabled && setOpen((v) => !v)}
          aria-expanded={open ? "true" : "false"}
          type="button"
          disabled={disabled || busy}
        >
          <MessageSquare className="mr-1 h-4 w-4" />
          {buttonLabel}
        </button>
      </div>

      {/* 다음 줄에 꽉 차게 표시: 부모가 flex-wrap 이어야 함 */}
      {open && (
        <div className={clsx("basis-full w-full mt-2")}>
          {depth === 0 ? (
            <textarea
              className="textarea textarea-bordered w-full min-h-[88px]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              disabled={disabled || busy}
            />
          ) : (
            <input
              className="input input-bordered w-full"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              disabled={disabled || busy}
            />
          )}

          <div className="mt-2 flex gap-2 justify-end">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (busy) return;
                setOpen(false);
                setDraft("");
              }}
              type="button"
              disabled={disabled || busy}
            >
              취소
            </button>
            <button
              className={clsx("btn btn-primary btn-sm", busy && "loading")}
              onClick={handlePost}
              type="button"
              disabled={disabled || busy || !draft.trim()}
            >
              {busy ? "등록중…" : "답글 등록"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
