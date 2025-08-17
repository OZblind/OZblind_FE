import type { CommentMeta } from "@src/mocks/post.demo";
import { fmtDate, fmtNum } from "@src/utils/utils";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  MoreVertical,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/** ===== 트리 유틸: 중첩 댓글 수정/삭제 ===== */
function updateCommentTree(
  nodes: CommentMeta[],
  id: CommentMeta["id"],
  updater: (c: CommentMeta) => CommentMeta
): CommentMeta[] {
  return nodes.map((n) => {
    if (n.id === id) {
      return updater(n);
    }
    if (n.replies?.length) {
      return {
        ...n,
        replies: updateCommentTree(n.replies, id, updater),
      };
    }
    return n;
  });
}

function deleteFromCommentTree(
  nodes: CommentMeta[],
  id: CommentMeta["id"]
): CommentMeta[] {
  const filtered = nodes
    .map((n) => {
      if (n.replies?.length) {
        return { ...n, replies: deleteFromCommentTree(n.replies, id) };
      }
      return n;
    })
    .filter((n) => n.id !== id);
  return filtered;
}

/** ===== 단일 댓글 아이템 (대댓글 포함 재귀 렌더) ===== */
function CommentItem({
  data,
  depth = 0,
  onEdit,
  onDelete,
}: {
  data: CommentMeta;
  depth?: number;
  onEdit: (id: CommentMeta["id"], content: string) => void;
  onDelete: (id: CommentMeta["id"]) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0 && data.hasReplies);
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [like, setLike] = useState(Boolean(data.liked));
  const [dislike, setDislike] = useState(Boolean(data.disliked));
  const [likes, setLikes] = useState(data.likes ?? 0);
  const [dislikes, setDislikes] = useState(data.dislikes ?? 0);

  // 편집 상태
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(data.content);

  // 드롭다운 제어 (키보드 접근성)
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setEditDraft(data.content);
  }, [data.content]);

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
    <div className={clsx("flex gap-3", depth > 0 && "pl-6")}>
      {/* Avatar (daisyUI) */}
      <div className="avatar mt-1">
        <div className="w-8 rounded-full bg-base-300 text-base-content/80 flex items-center justify-center text-xs">
          {data.author.slice(0, 2)}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <span className="font-medium text-base-content">{data.author}</span>
          <span>•</span>
          <span>{fmtDate(data.createdAt)}</span>

          {/* 점 3개 메뉴 */}
          <div className="ml-auto dropdown dropdown-end">
            <button
              className="btn btn-ghost btn-xs"
              aria-haspopup="menu"
              aria-expanded={menuOpen ? "true" : "false"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">댓글 메뉴</span>
            </button>
            <ul
              tabIndex={0}
              className={clsx(
                "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32",
                menuOpen ? "block" : "hidden"
              )}
              onKeyDown={(e) => {
                if (e.key === "Escape") setMenuOpen(false);
              }}
            >
              <li>
                <button
                  className="text-sm"
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
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

        <div className="mt-2 flex items-center gap-2">
          <button
            className={clsx("btn btn-ghost btn-sm", like && "text-primary")}
            onClick={handleLike}
            aria-pressed={like ? "true" : "false"}
          >
            <ThumbsUp className="mr-1 h-4 w-4" /> {fmtNum(likes)}
          </button>
          <button
            className={clsx("btn btn-ghost btn-sm", dislike && "text-primary")}
            onClick={handleDislike}
            aria-pressed={dislike ? "true" : "false"}
          >
            <ThumbsDown className="mr-1 h-4 w-4" /> {fmtNum(dislikes)}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setReplying((v) => !v)}
            aria-expanded={replying ? "true" : "false"}
          >
            <MessageSquare className="mr-1 h-4 w-4" /> 답글 작성
          </button>

          {data.hasReplies && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded ? "true" : "false"}
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

        {replying && (
          <div className="mt-3 flex flex-col gap-2">
            <label className="sr-only" htmlFor={`reply-${data.id}`}>
              답글 입력
            </label>
            <textarea
              id={`reply-${data.id}`}
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder="답글을 입력하세요"
              className="textarea textarea-bordered min-h-[88px]"
            />
            <div className="flex gap-2 self-end">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setReplying(false)}
                type="button"
              >
                취소
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  // TODO: 서버 전송 로직 연결 (현재는 UI만)
                  setReplyDraft("");
                  setReplying(false);
                }}
                type="button"
              >
                답글 등록
              </button>
            </div>
          </div>
        )}

        {expanded && data.replies && data.replies.length > 0 && (
          <div className="mt-4 space-y-6">
            {data.replies.map((r) => (
              <CommentItem
                key={r.id}
                data={r}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** ===== 댓글 목록 + 정렬(최신/좋아요) ===== */
type SortKey = "newest" | "oldest" | "likes";

export default function PostComment({ comments }: { comments: CommentMeta[] }) {
  // 로컬 상태로 관리(삭제/수정 반영)
  const [list, setList] = useState<CommentMeta[]>(comments);
  useEffect(() => setList(comments), [comments]);

  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const topLevelSorted = useMemo(() => {
    const arr = [...list];
    switch (sortKey) {
      case "newest":
        arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "oldest":
        arr.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "likes":
        arr.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        break;
      default:
        break;
    }
    return arr;
  }, [list, sortKey]);

  const handleEdit = (id: CommentMeta["id"], content: string) => {
    setList((prev) => updateCommentTree(prev, id, (c) => ({ ...c, content })));
    // TODO: 서버 PATCH 연결
  };

  const handleDelete = (id: CommentMeta["id"]) => {
    setList((prev) => deleteFromCommentTree(prev, id));
    // TODO: 서버 DELETE 연결
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">댓글 {fmtNum(list.length)}</h2>

        {/* 정렬 셀렉트 */}
        <div className="flex items-center gap-2">
          <select
            id="comment-sort"
            className="select select-sm select-bordered"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="댓글 정렬"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {topLevelSorted.map((c) => (
          <CommentItem
            key={c.id}
            data={c}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}

/* 데모 테스트:
import { comments } from "@src/mocks/post.demo";
<PostComment comments={comments} />
*/
