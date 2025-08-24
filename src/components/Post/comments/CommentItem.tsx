/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useCanManage } from "@src/hooks/useCanManage";
import { useToastStore } from "@src/store/toastStore";
import {
  toggleDislikeOnComment,
  toggleLikeOnComment,
} from "@src/api/reactions";

type CommentItemProps = {
  data: CommentMeta;
  depth?: number;
  rootId: CommentMeta["id"];
  branchStyle: { bg: string; stroke: string; fill: string };
  onEdit: (id: CommentMeta["id"], content: string) => void;
  onDelete: (id: CommentMeta["id"]) => void;
  onAddReply: (rootId: CommentMeta["id"], content: string) => void;
  submittingRootId?: string | null;
  loading?: boolean;
  mineIds: Set<string>;
};

export default function CommentItem({
  data,
  depth = 0,
  rootId,
  branchStyle, // { bg, stroke, fill }
  onEdit,
  onDelete,
  onAddReply,
  submittingRootId,
  loading,
  mineIds,
}: CommentItemProps) {
  const [expanded, setExpanded] = useState(depth === 0 && data.hasReplies);
  const [reacting, setReacting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(data.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const { canManage } = useCanManage(data.authorId, {
    allowAdmin: true,
    allowModerator: true,
  });

  //  내가 방금 작성한 댓글이면 즉시 오너 취급
  const canManageUI = canManage || mineIds.has(String(data.id));

  // === 1) 내 리액션 + 집계 상태 ===
  const initialMine =
    (data as any)?.viewerReaction ??
    (data.liked ? "like" : data.disliked ? "dislike" : null);
  const [mine, setMine] = useState<"like" | "dislike" | null>(initialMine);
  const [counts, setCounts] = useState(() => ({
    like:
      (data as any)?.reactions?.like ??
      (typeof data.likes === "number" ? data.likes : 0),
    dislike:
      (data as any)?.reactions?.dislike ??
      (typeof data.dislikes === "number" ? data.dislikes : 0),
  }));

  const toast = useToastStore();

  useEffect(() => {
    if (depth === 0 && data.hasReplies) setExpanded(true);
  }, [data.hasReplies, depth]);
  useEffect(() => setEditDraft(data.content), [data.content]);

  // === 2) 뒤로가기/재진입 보정 (서버가 viewerReaction 안 줄 때만) ===
  useEffect(() => {
    if ((data as any)?.viewerReaction == null) {
      const s = sessionStorage.getItem(`myReaction:comment:${data.id}`);
      if (s === "like" || s === "dislike") setMine(s as "like" | "dislike");
    }
  }, [data, data.id]);

  useEffect(() => {
    if (mine) sessionStorage.setItem(`myReaction:comment:${data.id}`, mine);
    else sessionStorage.removeItem(`myReaction:comment:${data.id}`);
  }, [mine, data.id]);

  // === 3) 토글 핸들러 (낙관적 업데이트 → 실패 시 롤백) ===
  const handleLike = async () => {
    if (reacting) return;
    setReacting(true);
    const prev = { mine, counts: { ...counts } };
    // mine 기준 증감
    let nextMine = mine;
    const nextCounts = { ...counts };
    if (mine === "like") {
      nextMine = null;
      nextCounts.like = Math.max(0, nextCounts.like - 1);
    } else if (mine === null) {
      nextMine = "like";
      nextCounts.like += 1;
    } else {
      // dislike → like
      nextCounts.dislike = Math.max(0, nextCounts.dislike - 1);
      nextCounts.like += 1;
      nextMine = "like";
    }
    setMine(nextMine);
    setCounts(nextCounts);
    try {
      await toggleLikeOnComment(Number(data.id));
    } catch (e) {
      setMine(prev.mine);
      setCounts(prev.counts);
      toast.push({ message: "리액션 처리에 실패했어요.", type: "error" });
    } finally {
      setReacting(false);
    }
  };

  const handleDislike = async () => {
    if (reacting) return;
    setReacting(true);
    const prev = { mine, counts: { ...counts } };
    let nextMine = mine;
    const nextCounts = { ...counts };
    if (mine === "dislike") {
      nextMine = null;
      nextCounts.dislike = Math.max(0, nextCounts.dislike - 1);
    } else if (mine === null) {
      nextMine = "dislike";
      nextCounts.dislike += 1;
    } else {
      // like → dislike
      nextCounts.like = Math.max(0, nextCounts.like - 1);
      nextCounts.dislike += 1;
      nextMine = "dislike";
    }
    setMine(nextMine);
    setCounts(nextCounts);
    try {
      await toggleDislikeOnComment(Number(data.id));
    } catch (e) {
      setMine(prev.mine);
      setCounts(prev.counts);
      toast.push({ message: "리액션 처리에 실패했어요.", type: "error" });
    } finally {
      setReacting(false);
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
        {/* 작성자/관리자만 메뉴 노출 */}
        {canManageUI && (
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
        )}
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
          className={clsx(
            "btn btn-ghost btn-sm",
            mine === "like" && "text-primary"
          )}
          onClick={handleLike}
          disabled={reacting}
          aria-pressed={mine === "like" ? "true" : "false"}
          type="button"
        >
          <ThumbsUp className="mr-1 h-4 w-4" /> {fmtNum(counts.like)}
        </button>
        <button
          className={clsx(
            "btn btn-ghost btn-sm",
            mine === "dislike" && "text-primary"
          )}
          onClick={handleDislike}
          disabled={reacting}
          aria-pressed={mine === "dislike" ? "true" : "false"}
          type="button"
        >
          <ThumbsDown className="mr-1 h-4 w-4" /> {fmtNum(counts.dislike)}
        </button>

        {/* 최상위 댓글에서만 “답글 작성” 표시 */}
        {depth === 0 && (
          <ReplyControl
            key={`reply-${rootId}`}
            depth={0}
            onSubmit={(content) => onAddReply(rootId, content)}
            // disabled={submittingRootId === String(rootId) || loading}  // 있으면 연결
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
              submittingRootId={submittingRootId}
              loading={loading}
              mineIds={mineIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
