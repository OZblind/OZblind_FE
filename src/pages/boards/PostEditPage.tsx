/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPostDetail, type PostDetail } from "@api/posts";
import { BOARD_ID, type BoardSlug } from "@constants/boards";
import { useCanManage } from "@src/hooks/useCanManage";
import { useToastStore } from "@src/store/toastStore";
import SurveyPostForm from "@src/components/Board/SurveyPostForm";
import SharedPostForm from "@src/components/Board/SharedPostForm";
import GithubPostForm from "@src/components/Board/GithubPostForm";

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const toast = useToastStore();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 상세 불러오기
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPostDetail(postId);
        if (!alive) return;
        setPost(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || e?.message || "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId]);

  // board id → slug 역매핑
  const idToSlug = useMemo(() => {
    const m = new Map<number, BoardSlug>();
    (Object.entries(BOARD_ID) as [BoardSlug, number][]).forEach(([slug, bid]) =>
      m.set(bid, slug)
    );
    return m;
  }, []);

  const boardSlug = useMemo<BoardSlug>(() => {
    if (!post) return "free";
    return idToSlug.get(post.board) ?? "free";
  }, [post, idToSlug]);

  // 권한 체크 (작성자/관리자/모더레이터)
  const authorId = useMemo(() => {
    const inline = (post as any)?.user?.id;
    return String(inline ?? post?.user_id ?? post?.author_id ?? "");
  }, [post]);
  const { canManage } = useCanManage(authorId, {
    allowAdmin: true,
    allowModerator: true,
  });

  useEffect(() => {
    if (!loading && post && !canManage) {
      toast.push({ type: "error", message: "수정 권한이 없습니다." });
      navigate(-1);
    }
  }, [loading, post, canManage, navigate, toast]);

  if (loading)
    return (
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">게시글 수정</h1>
        <p className="mt-4 opacity-70">불러오는 중…</p>
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">게시글 수정</h1>
        <p className="mt-4 text-red-500">{error}</p>
      </div>
    );

  if (!post)
    return (
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">게시글 수정</h1>
        <p className="mt-4 opacity-70">게시글을 찾을 수 없습니다.</p>
      </div>
    );

  // 폼별 초기값 추출 (백엔드 필드명에 맞춰 안전하게)
  const baseInitial = {
    title: String(post.title ?? ""),
    content: String(post.content ?? ""),
  };
  const surveyInitial = {
    ...baseInitial,
    formLink: (post as any).form_link ?? (post as any).formLink ?? "",
    endDate: (post as any).end_date ?? (post as any).endDate ?? "",
  };
  const githubInitial = {
    ...baseInitial,
    repoUrl: (post as any).repo_url ?? (post as any).repoUrl ?? "",
  };

  return (
    <div className="flex flex-col w-full h-full gap-2 text-black">
      {boardSlug === "survey" ? (
        <SurveyPostForm
          mode="edit"
          postId={postId}
          initial={surveyInitial}
          onCancel={() => navigate(-1)}
          onSubmitted={() => navigate(`/posts/${postId}`)}
        />
      ) : boardSlug === "github" ? (
        <GithubPostForm
          mode="edit"
          postId={postId}
          initial={githubInitial}
          onCancel={() => navigate(-1)}
          onSubmitted={() => navigate(`/posts/${postId}`)}
        />
      ) : (
        <SharedPostForm
          mode="edit"
          board={boardSlug}
          postId={postId}
          initial={baseInitial}
          onCancel={() => navigate(-1)}
          onSubmitted={() => navigate(`/posts/${postId}`)}
        />
      )}
    </div>
  );
}
