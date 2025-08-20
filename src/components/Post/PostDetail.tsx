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
import { demoComments } from "@src/mocks/post.demo";
import { fmtDate, fmtNum } from "@src/utils/utils";
import { PostComment } from "@src/components/Post/comments";
import DropdownMenu, {
  type DropdownItem,
} from "@src/components/ui/DropdownMenu";
import { useToastStore } from "@src/store/toastStore";
import type { CommentMeta, PostMeta } from "@src/types/post";
import { onlyWhen, useCanManage } from "@src/hooks/useCanManage";
import { fetchRandomNickname } from "@src/api/nickname";
import { profileToTagsMock } from "@src/mocks/tags.mock";
import AssignedTagList from "../tags/AssignedTagList";
import { RepoPreviewCard } from "../Board/RepoPreviewCard";
import LinkPreviewCard from "../Board/LinkPreviewCard";

const BOARD_LABEL: Record<string, string> = {
  free: "자유게시판",
  job: "취업게시판",
  info: "정보게시판",
  survey: "설문게시판",
  github: "깃헙게시판",
};

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
    const text = commentDraft.trim();
    if (!text) return;

    // TODO: API 연동
    try {
      const nickname = await fetchRandomNickname();
      setComments((prev) => [
        {
          id: Math.random().toString(36).slice(2), // string ID여도 PostComment가 대응함
          author: nickname, // 닉네임(짧은 표시용)
          authorId: "me", // 고유 사용자 ID (실제 로그인 유저 ID 넣는게 베스트)
          authorName: "현재 사용자", // 선택적 표시 이름
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
    } catch (err) {
      console.error(err);
      useToastStore.getState().push({
        message: "닉네임 생성에 실패했습니다!",
        type: "error",
        durationMs: 3000, // 선택 (기본값: 2500ms)
      });
    }
    setSubmitting(false);
  };

  const { canManage } = useCanManage(post.authorId, {
    allowAdmin: true,
    allowModerator: true,
  });

  // 상단 드롭다운 액션 (필요 시 실제 로직 연결)
  const menuItems: DropdownItem[] = [
    {
      label: "URL 복사",
      icon: <Copy className="h-4 w-4" />,
      onSelect: () => {
        void navigator.clipboard.writeText(window.location.href);

        useToastStore.getState().push({
          message: "URL 복사에 성공했습니다!",
          type: "success",
          durationMs: 3000, // 선택 (기본값: 2500ms)
        });
      },
    },
    // 작성자/관리자 전용
    ...onlyWhen(canManage, [
      {
        label: "게시글 수정",
        icon: <Pencil className="h-4 w-4" />,
        onSelect: () => {
          // TODO: 수정 페이지 이동
        },
      },
      {
        label: "게시글 삭제",
        icon: <Trash2 className="h-4 w-4" />,
        danger: true,
        onSelect: () => {
          // TODO: 삭제 로직
        },
      },
    ]),
  ];
  const tags = profileToTagsMock("11기", "프론트");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:py-8">
      {/* 상단 바 */}
      <div className="flex items-center justify-between text-sm text-base-content/70">
        <div className="flex items-center gap-2">
          <span className="font-medium text-base-content">
            {BOARD_LABEL[post.boardName] ?? post.boardName}
          </span>
          <span>•</span>
          <span>{fmtDate(post.createdAt)}</span>
        </div>

        {/* dropdown: role/tabIndex 없이 ul>li>button 패턴 */}
        <div className="dropdown dropdown-end">
          <DropdownMenu
            items={menuItems}
            trigger={<MoreHorizontal className="h-5 w-5" />}
            align="end"
            triggerAriaLabel="게시글 메뉴"
          />
        </div>
      </div>

      {/* 제목 */}
      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {/* 태그 리스트 */}
        <div className="flex items-center leading-none">
          <AssignedTagList tags={tags} />
        </div>

        {/* 오른쪽 (조회수, 댓글수) */}
        <div className="ml-auto flex items-center gap-4 text-base-content/70 leading-none">
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
      {/* 본문 위 카드 */}
      {(() => {
        switch (post.boardName) {
          case "survey":
            return (
              <div className="mb-6">
                <LinkPreviewCard
                  url={post.formLink ?? ""}
                  title={post.title}
                  endDate={post.endDate}
                />
              </div>
            );
          case "github":
            return (
              post.repoUrl && (
                <div className="mb-6">
                  <RepoPreviewCard repoLink={post.repoUrl} />
                </div>
              )
            );
          default:
            return null;
        }
      })()}
      {/* 본문 */}
      <div className="m-2 bg-base-100 shadow-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* 리액션 바 */}
      <div className="mt-12 flex flex-wrap items-center gap-1">
        <button
          className={clsx("btn btn-ghost btn-sm", like && "text-primary")}
          onClick={toggleLike}
          aria-pressed={!!like}
          type="button"
        >
          <ThumbsUp className="mr-1 h-4 w-4" /> {fmtNum(reaction.like)}
        </button>

        <button
          className={clsx("btn btn-ghost btn-sm", dislike && "text-primary")}
          onClick={toggleDislike}
          aria-pressed={!!dislike}
          type="button"
        >
          <ThumbsDown className="mr-1 h-4 w-4" /> {fmtNum(reaction.dislike)}
        </button>

        <button
          className={clsx("btn btn-ghost btn-sm", bookmarked && "text-primary")}
          onClick={() => setBookmarked((v) => !v)}
          aria-pressed={!!bookmarked}
          type="button"
        >
          <Bookmark className="mr-2 h-4 w-4" /> {fmtNum(reaction.bookmark)}
        </button>
      </div>

      {/* 댓글 입력 */}
      <div className="mt-4">
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
            type="button"
          >
            취소
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={submitComment}
            disabled={submitting}
            type="button"
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
