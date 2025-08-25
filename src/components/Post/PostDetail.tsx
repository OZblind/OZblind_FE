/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
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
import BookmarkButton from "../ui/BookmarkButton";
import { fetchMyBookmarks } from "@src/api/bookmarks";
import { deletePost } from "@src/api/posts";

const BOARD_LABEL: Record<string, string> = {
  free: "자유게시판",
  jobs: "취업게시판",
  info: "정보게시판",
  survey: "설문게시판",
  github: "깃헙게시판",
};

export default function PostDetail({
  post,
  initialComments,
}: {
  post: PostMeta;
  initialComments?: any[];
}) {
  const [reacting, setReacting] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState<number>(
    post.reactions.bookmark ?? 0
  );
  const [isBookmarkedByMe, setIsBookmarkedByMe] = useState<boolean | null>(
    null
  );
  const [commentDraft, setCommentDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [firstCommentSeed, setFirstCommentSeed] = useState<any[] | null>(null);
  const [firstCommentMineIds, setFirstCommentMineIds] = useState<
    string[] | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  // 작성자 id 보정 (inline user → authorId 순)
  const authorIdResolved = String(
    (post as any).user?.id ?? post.authorId ?? ""
  );

  // 헤더에 표시되는 댓글 수를 낙관적으로 올려주기 위한 로컬 상태
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  useEffect(() => setCommentsCount(post.commentsCount), [post.commentsCount]);

  const navigate = useNavigate();
  const toast = useToastStore();

  // 내 리액션 상태
  const [mine, setMine] = useState<"like" | "dislike" | null>(
    ((post as any).viewerReaction as any) ?? null
  );

  // 집계 상태
  const [reaction, setReaction] = useState(() => ({
    like: post.reactions.like,
    dislike: post.reactions.dislike,
    bookmark: post.reactions.bookmark,
  }));
  const like = mine === "like";
  const dislike = mine === "dislike";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchMyBookmarks(); // [{postId, title}, ...]
        if (!alive) return;
        setIsBookmarkedByMe(list.some((b) => b.postId === Number(post.id)));
      } catch {
        if (!alive) return;
        setIsBookmarkedByMe(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [post.id]);

  // 뒤로가기/재진입 보정
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

  // 리액션 토글(낙관적)
  const doToggle = async (next: "like" | "dislike") => {
    if (reacting) return;
    setReacting(true);
    const prev = { mine, reaction: { ...reaction } };

    let nextMine: typeof mine = mine;
    const nextCounts = { ...reaction };
    if (mine === next) {
      nextMine = null;
      nextCounts[next] = Math.max(0, nextCounts[next] - 1);
    } else if (mine === null) {
      nextMine = next;
      nextCounts[next] += 1;
    } else {
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
    } catch (e: any) {
      setMine(prev.mine);
      setReaction(prev.reaction);
      const code = e?.response?.status;
      if (code === 401)
        toast.push({ message: "로그인이 필요합니다.", type: "warning" });
      else if (code === 403)
        toast.push({ message: "권한이 없습니다.", type: "warning" });
      else toast.push({ message: "리액션 처리에 실패했어요.", type: "error" });
    } finally {
      setReacting(false);
    }
  };

  // 루트 댓글 작성 (재조회/리마운트 없이 이벤트로 알려줌)
  const submitComment = async () => {
    const text = commentDraft.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      const created = await createRootComment(post.id, text); // 생성된 댓글 객체 받기
      setCommentDraft("");

      // 댓글 리스트(PostComment)에게 "실제 댓글 객체" 브로드캐스트
      window.dispatchEvent(
        new CustomEvent("comment:root-added", {
          detail: { postId: post.id, comment: created },
        })
      );

      // 헤더 표시용 댓글 수도 낙관적으로 +1
      setCommentsCount((c) => c + 1);

      setFirstCommentSeed([created]);
      setFirstCommentMineIds([String(created.id)]);

      toast.push({ message: "댓글이 등록되었습니다.", type: "success" });
    } catch (e: any) {
      const code = e?.response?.status;
      if (code === 401)
        toast.push({ message: "로그인이 필요합니다.", type: "warning" });
      else if (code === 403)
        toast.push({ message: "권한이 없습니다.", type: "warning" });
      else toast.push({ message: "댓글 등록에 실패했어요.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };
  async function handleDeletePost() {
    if (deleting) return;
    const ok = window.confirm(
      "이 게시글을 삭제할까요? 삭제 후 되돌릴 수 없습니다."
    );
    if (!ok) return;

    setDeleting(true);
    try {
      await deletePost(Number(post.id));
      toast.push({ message: "게시글이 삭제되었습니다.", type: "success" });

      // 삭제 후 목록으로 이동
      navigate(`/board/${post.boardSlug}`);
    } catch (e: any) {
      const code = e?.response?.status;
      if (code === 401)
        toast.push({ message: "로그인이 필요합니다.", type: "warning" });
      else if (code === 403)
        toast.push({ message: "삭제 권한이 없습니다.", type: "warning" });
      else toast.push({ message: "게시글 삭제에 실패했어요.", type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  const { canManage } = useCanManage(authorIdResolved, {
    allowAdmin: true,
    allowModerator: true,
  });

  const menuItems: DropdownItem[] = [
    {
      label: "URL 복사",
      icon: <Copy className="h-4 w-4" />,
      onSelect: () => {
        void navigator.clipboard.writeText(window.location.href);
        toast.push({
          message: "URL 복사에 성공했습니다!",
          type: "success",
          durationMs: 3000,
        });
      },
    },
    ...onlyWhen(canManage, [
      {
        id: "edit",
        label: "게시글 수정",
        icon: <Pencil className="h-4 w-4" />,
        onSelect: () => navigate(urlForPost.postEdit(String(post.id))),
        disabled: deleting, // 삭제 중일 땐 비활성화
      },
      {
        label: "게시글 삭제",
        icon: <Trash2 className="h-4 w-4" />,
        danger: true,
        onSelect: handleDeletePost, //  삭제 호출
        disabled: deleting,
      },
    ]),
  ];

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
            aria-label={`${
              BOARD_LABEL[post.boardName] ?? post.boardName
            } 목록으로 이동`}
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
            <MessageSquare className="h-4 w-4" /> {fmtNum(commentsCount)}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="divider my-5"></div>

      {/* 본문 위 카드 */}
      {(() => {
        switch (post.boardSlug) {
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
            return post.repoUrl ? (
              <div className="mb-6">
                <RepoPreviewCard repoLink={post.repoUrl} />
              </div>
            ) : null;
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

        <BookmarkButton
          postId={Number(post.id)} // 문자열이면 Number(...)로
          initialBookmarked={Boolean(isBookmarkedByMe)}
          initialCount={bookmarkCount}
          onCountChange={(next) => {
            setBookmarkCount(next);
            // 필요시 post 상태 동기화
          }}
        />
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

      {/* 댓글 창 (이제 더 이상 key로 리마운트하지 않음) */}
      {commentsCount > 0 && (
        <PostComment
          postId={post.id}
          // initialComments가 있으면 그걸, 없으면 첫 댓글 시드를 전달
          initialItems={
            initialComments && initialComments.length > 0
              ? initialComments
              : firstCommentSeed || undefined
          }
          mineIdsSeed={firstCommentMineIds || undefined}
        />
      )}
      <div className="h-16 md:h-24" aria-hidden />
    </div>
  );
}
