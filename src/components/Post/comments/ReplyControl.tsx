import { useState } from "react";
import { MessageSquare } from "lucide-react";
import clsx from "clsx";

export default function ReplyControl({
  depth,
  onSubmit,
}: {
  depth: number;
  onSubmit: (content: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const handlePost = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setDraft("");
    setOpen(false);
  };

  return (
    <>
      {/* 액션 바 안: 버튼만 인라인 */}
      <div className="inline-flex">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open ? "true" : "false"}
          type="button"
        >
          <MessageSquare className="mr-1 h-4 w-4" /> 답글 작성
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
              placeholder="답글을 입력하세요"
            />
          ) : (
            <input
              className="input input-bordered w-full"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="답글을 입력하세요"
              onKeyDown={(e) => e.key === "Enter" && handlePost()}
            />
          )}

          <div className="mt-2 flex gap-2 justify-end">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setOpen(false);
                setDraft("");
              }}
              type="button"
            >
              취소
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePost}
              type="button"
            >
              답글 등록
            </button>
          </div>
        </div>
      )}
    </>
  );
}
