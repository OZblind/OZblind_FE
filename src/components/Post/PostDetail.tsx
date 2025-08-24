/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
import { fmtDate, fmtNum } from "@src/utils/utils";
import { PostComment } from "@src/components/Post/comments";
import DropdownMenu, {
  type DropdownItem,
} from "@src/components/ui/DropdownMenu";
import { useToastStore } from "@src/store/toastStore";
import type { PostMeta } from "@src/types/post";
import { onlyWhen, useCanManage } from "@src/hooks/useCanManage";
import { useAssignedTags } from "@hooks/useAssignedTags";
import type { RawUserTag } from "@api/tags";
import AssignedTagList from "../tags/AssignedTagList";
import { RepoPreviewCard } from "../Board/RepoPreviewCard";
import LinkPreviewCard from "../Board/LinkPreviewCard";
import { Link, useNavigate } from "react-router-dom";
import { urlForPost } from "@src/utils/urlForPost";
import { createRootComment } from "@api/comments";
import { toggleReaction } from "@src/api/reactions";

const BOARD_LABEL: Record<string, string> = {
  free: "자유게시판",
  jobs: "취업게시판",
  info: "정보게시판",
  survey: "설문게시판",
  github: "깃헙게시판",
};

// ================== Main ==================
export default function PostDetail({ post }: { post: PostMeta }) {
  const [reacting, setReacting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();
  const toast = useToastStore();

  // 1) 내 리액션 상태 (like | dislike | null)
  const [mine, setMine] = useState<"like" | "dislike" | null>(
    ((post as any).viewerReaction as any) ?? null
  );

  // 2) 집계 상태(서버 값을 초기값으로 사용)
  const [reaction, setReaction] = useState(() => ({
    like: post.reactions.like,
    dislike: post.reactions.dislike,
    bookmark: post.reactions.bookmark,
  }));
  // 버튼 표시용 파생값
  const like = mine === "like";
  const dislike = mine === "dislike";

  // 3) 뒤로가기/재진입 시에도 일관되게 보이도록 세션 스토리지로 보정
  useEffect(() => {
    if ((post as any).viewerReaction == null) {
      const stored = sessionStorage.getItem(`myReaction:${post.id}`);
      if (stored === "like" || stored === "dislike") {
        setMine(stored as "like" | "dislike");
      }
    }
  }, [post, post.id]);
  useEffect(() => {
    if (mine) sessionStorage.setItem(`myReaction:${post.id}`, mine);
    else sessionStorage.removeItem(`myReaction:${post.id}`);
  }, [mine, post.id]);

  // 공통 토글 로직 (낙관적 업데이트 → 실패 시 롤백)
  const doToggle = async (next: "like" | "dislike") => {
    if (reacting) return;
    setReacting(true);
    const prev = { mine, reaction: { ...reaction } };

    // 낙관적 업데이트(집계 + 내 상태 동시 반영)
    let nextMine: typeof mine = mine;
    const nextCounts = { ...reaction };
    if (mine === next) {
      // 취소
      nextMine = null;
      nextCounts[next] = Math.max(0, nextCounts[next] - 1);
    } else if (mine === null) {
      // 새로 선택
      nextMine = next;
      nextCounts[next] += 1;
    } else {
      // 변경 (like ↔ dislike)
      nextCounts[mine] = Math.max(0, nextCounts[mine] - 1);
      nextCounts[next] += 1;
      nextMine = next;
    }
    setMine(nextMine);
    setReaction(nextCounts);

    try {
      await toggleReaction({
        target_type: "post",
        target_id: post.id,
        reaction: next,
      });
      // 성공 시: 그대로 두면 됨 (서버 카운트는 상위 쿼리에서 재검증/동기화되면 더 좋음)
    } catch (e: any) {
      // 실패 → 롤백
      setMine(prev.mine);
      setReaction(prev.reaction);
      const code = e?.response?.status;
      if (code === 401) {
        toast.push({ message: "로그인이 필요합니다.", type: "warning" });
      } else if (code === 403) {
        toast.push({ message: "권한이 없습니다.", type: "warning" });
      } else {
        toast.push({ message: "리액션 처리에 실패했어요.", type: "error" });
      }
    } finally {
      setReacting(false);
    }
  };

  // 중앙 API(createRootComment)로 루트 댓글 작성
  const submitComment = async () => {
    const text = commentDraft.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      await createRootComment(post.id, text); // ← /api/comments POST (root 없이)
      setCommentDraft("");
      setRefreshKey((k) => k + 1); // 댓글 목록 재조회(리마운트 유도)
      toast.push({ message: "댓글이 등록되었습니다.", type: "success" });
    } catch (e: any) {
      const code = e?.response?.status;
      if (code === 401) {
        toast.push({ message: "로그인이 필요합니다.", type: "warning" });
      } else if (code === 403) {
        toast.push({ message: "권한이 없습니다.", type: "warning" });
      } else {
        toast.push({ message: "댓글 등록에 실패했어요.", type: "error" });
      }
    } finally {
      setSubmitting(false); // 반드시 로더 해제
    }
  };

  const { canManage } = useCanManage(post.authorId, {
    allowAdmin: true,
    allowModerator: true,
  });

  // 상단 드롭다운 액션
  const menuItems: DropdownItem[] = [
    {
      label: "URL 복사",
      icon: <Copy className="h-4 w-4" />,
      onSelect: () => {
        void navigator.clipboard.writeText(window.location.href);
        toast.push({
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
          navigate(urlForPost.postEdit(String(post.id)));
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

  // 작성자 태그
  const { tags, loading: authorLoading } = useAssignedTags("author", {
    inlineUser: (post as unknown as { user?: RawUserTag | null }).user,
    postId: post.id,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:py-8">
      {/* 상단 바 */}
      <div className="flex items-center justify-between text-sm text-base-content/70">
        <div className="flex items-center gap-2">
          <Link
            to={`/board/${post.boardSlug}`}
            className="font-medium text-base-content hover:underline"
            aria-label={`${BOARD_LABEL[post.boardName] ?? post.boardName} 목록으로 이동`}
          >
            {BOARD_LABEL[post.boardName] ?? post.boardName}
          </Link>
          <span>•</span>
          <span>{fmtDate(post.createdAt)}</span>
        </div>

        {/* dropdown */}
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
          {!authorLoading && <AssignedTagList tags={tags} />}
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
          onClick={() => doToggle("like")}
          disabled={reacting}
          aria-pressed={!!like}
          type="button"
        >
          <ThumbsUp className="mr-1 h-4 w-4" /> {fmtNum(reaction.like)}
        </button>

        <button
          className={clsx("btn btn-ghost btn-sm", dislike && "text-primary")}
          onClick={() => doToggle("dislike")}
          disabled={reacting}
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
          <Bookmark className="mr-2 h-4 w-4" />{" "}
          {fmtNum(reaction.bookmark + (bookmarked ? 1 : 0))}
        </button>
      </div>

      {/* 댓글 입력 */}
      <div className="mt-4">
        <textarea
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          placeholder="주제와 무관한 댓글은 삭제될 수 있습니다."
          className="textarea textarea-bordered w-full min-h-[88px]"
          disabled={submitting}
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setCommentDraft("")}
            type="button"
            disabled={submitting}
          >
            취소
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={submitComment}
            disabled={submitting || !commentDraft.trim()}
            type="button"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            댓글 작성
          </button>
        </div>
      </div>

      {/* 댓글 창 */}
      <PostComment key={refreshKey} postId={post.id} />
    </div>
  );
}
