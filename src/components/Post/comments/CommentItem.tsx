import { fmtDate, fmtNum } from "@src/utils/utils";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import ReplyControl from "./ReplyControl";
import type { CommentMeta } from "@src/types/post";

export default function CommentItem({
  data,
  depth = 0,
  rootId,
  branchStyle, // { bg, stroke, fill }
  onEdit,
  onDelete,
  onAddReply,
}: {
  data: CommentMeta;
  depth?: number;
  rootId: CommentMeta["id"];
  branchStyle: { bg: string; stroke: string; fill: string };
  onEdit: (id: CommentMeta["id"], content: string) => void;
  onDelete: (id: CommentMeta["id"]) => void;
  onAddReply: (rootId: CommentMeta["id"], content: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0 && data.hasReplies);
  const [like, setLike] = useState(Boolean(data.liked));
  const [dislike, setDislike] = useState(Boolean(data.disliked));
  const [likes, setLikes] = useState(data.likes ?? 0);
  const [dislikes, setDislikes] = useState(data.dislikes ?? 0);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(data.content);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (depth === 0 && data.hasReplies) setExpanded(true);
  }, [data.hasReplies, depth]);
  useEffect(() => setEditDraft(data.content), [data.content]);

  const handleLike = () => {
    if (like) {
      setLike(false);
      setLikes((v) => Math.max(0, v - 1));
    } else {
      setLike(true);
      setLikes((v) => v + 1);
      if (dislike) {
        setDislike(false);
        setDislikes((v) => Math.max(0, v - 1));
      }
    }
  };
  const handleDislike = () => {
    if (dislike) {
      setDislike(false);
      setDislikes((v) => Math.max(0, v - 1));
    } else {
      setDislike(true);
      setDislikes((v) => v + 1);
      if (like) {
        setLike(false);
        setLikes((v) => Math.max(0, v - 1));
      }
    }
  };

  return (
    <div className={clsx(depth > 0 ? "relative pl-6" : "")}>
      {/* depth>0: 곡선 연결 + 노드 (굵기 업) */}
      {depth > 0 && (
        <svg
          aria-hidden="true"
          viewBox="0 4 20 14"
          className={clsx(
            "pointer-events-none absolute -left-7 w-7 overflow-visible thread-elbow",
            branchStyle.stroke,
            branchStyle.fill
          )}
        >
          {/* 곡선: 중앙(y=7) 기준, 굵기 ↑ */}
          <path
            d="M0 0 C 0 7, 12 7, 28 7"
            className="fill-none stroke-current stroke-[4px] opacity-70"
          />
          {/* 끝 노드: 중앙(y=7)에 위치 */}
          <circle cx="28" cy="7" r="3.5" className="fill-current opacity-90" />
        </svg>
      )}

      {/* 헤더 */}
      <div className="flex items-center gap-2 text-sm text-base-content/70">
        <span className="font-medium text-base-content">{data.author}</span>
        <span>•</span>
        <span>{fmtDate(data.createdAt)}</span>

        {/* 점 3개 드롭다운 */}
        <div className="ml-auto dropdown dropdown-end">
          <button
            className="btn btn-ghost btn-xs"
            aria-expanded={menuOpen ? "true" : "false"}
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">댓글 메뉴</span>
          </button>
          <ul
            className={clsx(
              "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32",
              menuOpen ? "block" : "hidden"
            )}
            onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
            aria-label="댓글 메뉴"
          >
            <li>
              <button
                className="text-sm"
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
                type="button"
              >
                댓글 수정
              </button>
            </li>
            <li>
              <button
                className="text-sm text-error"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(data.id);
                }}
                type="button"
              >
                댓글 삭제
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* 본문 / 편집 */}
      {editing ? (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            className="textarea textarea-bordered min-h-[88px]"
            value={editDraft}
            onChange={(e) => setEditDraft(e.target.value)}
            aria-label="댓글 내용 수정"
          />
          <div className="flex gap-2 self-end">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setEditing(false);
                setEditDraft(data.content);
              }}
              type="button"
            >
              취소
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                const trimmed = editDraft.trim();
                if (!trimmed) return;
                onEdit(data.id, trimmed);
                setEditing(false);
              }}
              type="button"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <div className="whitespace-pre-wrap text-sm leading-6 mt-1">
          {data.content}
        </div>
      )}

      {/* 액션바 + 답글 입력(다음 줄) */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          className={clsx("btn btn-ghost btn-sm", like && "text-primary")}
          onClick={handleLike}
          aria-pressed={like ? "true" : "false"}
          type="button"
        >
          <ThumbsUp className="mr-1 h-4 w-4" /> {fmtNum(likes)}
        </button>
        <button
          className={clsx("btn btn-ghost btn-sm", dislike && "text-primary")}
          onClick={handleDislike}
          aria-pressed={dislike ? "true" : "false"}
          type="button"
        >
          <ThumbsDown className="mr-1 h-4 w-4" /> {fmtNum(dislikes)}
        </button>

        {/* 최상위 댓글에서만 “답글 작성” 표시 */}
        {depth === 0 && (
          <ReplyControl
            depth={0}
            onSubmit={(content) => onAddReply(rootId, content)}
          />
        )}

        {data.hasReplies && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded ? "true" : "false"}
            type="button"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" /> 답글 접기
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" /> 답글 펼치기
              </>
            )}
          </button>
        )}
      </div>

      {/* 대댓글 */}
      {expanded && data.replies && data.replies.length > 0 && (
        <div className="mt-4 space-y-6">
          {data.replies.map((r) => (
            <CommentItem
              key={r.id}
              data={r}
              depth={depth + 1}
              rootId={rootId}
              branchStyle={branchStyle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
