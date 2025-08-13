import { useMemo, useState } from "react";
import {
  Bookmark,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
  Eye,
  Copy,
  Trash2,
  Pencil,
} from "lucide-react";
import clsx from "clsx";
import {
  demoComments,
  type CommentMeta,
  type PostMeta,
} from "@src/mocks/post.demo";
import { fmtDate, fmtNum } from "@src/utils/utils";
import PostComment from "./PostComment";

// ================== Main ==================
export default function PostDetail({ post }: { post: PostMeta }) {
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [comments, setComments] = useState<CommentMeta[]>(() => demoComments);

  const reaction = useMemo(
    () => ({
      like: post.reactions.like + (like ? 1 : 0),
      dislike: post.reactions.dislike + (dislike ? 1 : 0),
      bookmark: post.reactions.bookmark + (bookmarked ? 1 : 0),
    }),
    [like, dislike, bookmarked, post.reactions]
  );

  const toggleLike = () => {
    if (like) setLike(false);
    else {
      setLike(true);
      if (dislike) setDislike(false);
    }
  };

  const toggleDislike = () => {
    if (dislike) setDislike(false);
    else {
      setDislike(true);
      if (like) setLike(false);
    }
  };

  const submitComment = async () => {
    if (!commentDraft.trim()) return;
    setSubmitting(true);
    // TODO: API 연동
    setTimeout(() => {
      setComments((prev) => [
        {
          id: Math.random().toString(36).slice(2),
          author: "나",
          content: commentDraft.trim(),
          createdAt: new Date().toISOString(),
          liked: false,
          disliked: false,
          likes: 0,
          dislikes: 0,
        },
        ...prev,
      ]);
      setCommentDraft("");
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:py-8">
      {/* 상단 바 */}
      <div className="flex items-center justify-between text-sm text-base-content/70">
        <div className="flex items-center gap-2">
          <span className="font-medium text-base-content">
            {post.boardName}
          </span>
          <span>•</span>
          <span>{fmtDate(post.createdAt)}</span>
        </div>

        {/* dropdown (daisyUI) */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-sm"
            aria-label="more"
          >
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
          >
            <li>
              <a className="flex items-center">
                <Copy className="h-4 w-4" /> URL 복사
              </a>
            </li>
            <li>
              <a className="flex items-center">
                <Trash2 className="h-4 w-4" /> 게시글 삭제
              </a>
            </li>
            <li>
              <a className="flex items-center">
                <Pencil className="h-4 w-4" /> 게시글 수정
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* 제목 */}
      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">
        {post.title}
      </h1>

      {/* 태그 / 메타 */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {post.cohort && (
          <span className="badge badge-neutral">{post.cohort}</span>
        )}
        {post.category && (
          <span className="badge badge-outline">{post.category}</span>
        )}
        <div className="ml-auto flex items-center gap-4 text-base-content/70">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {fmtNum(post.views)}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> {fmtNum(post.commentsCount)}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="divider my-5"></div>

      {/* 본문 카드 */}
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body prose max-w-none dark:prose-invert p-6">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      {/* 리액션 바 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          className={clsx("btn btn-ghost btn-sm", like && "text-primary")}
          onClick={toggleLike}
          aria-pressed={!!like}
        >
          <ThumbsUp className="mr-1 h-4 w-4" /> {fmtNum(reaction.like)}
        </button>

        <button
          className={clsx("btn btn-ghost btn-sm", dislike && "text-primary")}
          onClick={toggleDislike}
          aria-pressed={!!dislike}
        >
          <ThumbsDown className="mr-1 h-4 w-4" /> {fmtNum(reaction.dislike)}
        </button>

        <button
          className={clsx("btn btn-ghost btn-sm", bookmarked && "text-primary")}
          onClick={() => setBookmarked((v) => !v)}
          aria-pressed={!!bookmarked}
        >
          <Bookmark className="mr-2 h-4 w-4" /> {fmtNum(reaction.bookmark)}
        </button>
      </div>

      {/* 댓글 입력 */}
      <div className="mt-8">
        <textarea
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          placeholder="주제와 무관한 댓글은 삭제될 수 있습니다."
          className="textarea textarea-bordered w-full min-h-[88px]"
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setCommentDraft("")}
          >
            취소
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={submitComment}
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            댓글 작성
          </button>
        </div>
      </div>

      {/* 댓글 창 */}
      <PostComment comments={comments} />
    </div>
  );
}

// 사용 예시
// <PostDetail post={demoPost} />
