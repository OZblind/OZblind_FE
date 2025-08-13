import type { CommentMeta } from "@src/mocks/post.demo";
import { fmtDate, fmtNum } from "@src/utils/utils";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useMemo, useState } from "react";

/** 단일 댓글 아이템 (대댓글 포함 재귀 렌더) */
function CommentItem({
  data,
  depth = 0,
}: {
  data: CommentMeta;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth === 0 && data.hasReplies);
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [like, setLike] = useState(Boolean(data.liked));
  const [dislike, setDislike] = useState(Boolean(data.disliked));
  const [likes, setLikes] = useState(data.likes ?? 0);
  const [dislikes, setDislikes] = useState(data.dislikes ?? 0);

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
        </div>

        <div className="whitespace-pre-wrap text-sm leading-6 mt-1">
          {data.content}
        </div>

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
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
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
                  setDraft("");
                  setReplying(false);
                  // TODO: 서버 전송 로직 연결
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
              <CommentItem key={r.id} data={r} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 댓글 목록 + 정렬 토글 */
export default function PostComment({ comments }: { comments: CommentMeta[] }) {
  const [sortByNewest, setSortByNewest] = useState(true);

  const sorted = useMemo(() => {
    const arr = [...comments];
    arr.sort((a, b) =>
      sortByNewest
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );
    return arr;
  }, [comments, sortByNewest]);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          댓글 {fmtNum(comments.length)}
        </h2>
        <button
          className="btn btn-ghost btn-sm gap-1"
          onClick={() => setSortByNewest((v) => !v)}
          type="button"
          aria-pressed={sortByNewest ? "true" : "false"}
          title={sortByNewest ? "최신순" : "오래된순"}
        >
          {sortByNewest ? "최신순" : "오래된순"}{" "}
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-8">
        {sorted.map((c) => (
          <CommentItem key={c.id} data={c} />
        ))}
      </div>
    </section>
  );
}

/* 데모 데이터로 바로 테스트하고 싶다면:
import { comments } from "@src/mocks/post.demo";
<PostComment comments={comments} />
*/
