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
    <div className="inline-flex flex-col">
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open ? "true" : "false"}
        type="button"
      >
        <MessageSquare className="mr-1 h-4 w-4" /> 답글 작성
      </button>

      {open && (
        <div
          className={clsx("mt-2 flex flex-col gap-2", depth === 0 && "w-full")}
        >
          {depth === 0 ? (
            <textarea
              className="textarea textarea-bordered min-h-[88px]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="답글을 입력하세요"
            />
          ) : (
            <input
              className="input input-bordered"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="답글을 입력하세요"
              onKeyDown={(e) => e.key === "Enter" && handlePost()}
            />
          )}

          <div className="flex gap-2 self-end">
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
    </div>
  );
}
