/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/post/PostEditPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPostDetail } from "@api/posts";
import { fetchSurveyExtra, fetchGithubExtra } from "@api/posts.special";
import { BOARD_ID, type BoardSlug } from "@constants/boards";

import { useToastStore } from "@src/store/toastStore";
import { useCanManage } from "@src/hooks/useCanManage";
import SurveyPostForm from "@src/components/Board/SurveyPostForm";
import GitRepoPostForm from "@src/components/Board/GithubPostForm";
import SharedPostForm from "@src/components/Board/SharedPostForm";

type Initials =
  | { title: string; content: string } // 공통
  | { title: string; content: string; formLink?: string; endDate?: string } // 설문
  | { title: string; content: string; repoUrl?: string }; // 깃

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Awaited<
    ReturnType<typeof fetchPostDetail>
  > | null>(null);
  const [initial, setInitial] = useState<Initials | null>(null);
  const toast = useToastStore();
  const navigate = useNavigate();

  // board id -> slug
  const idToSlug = useMemo(() => {
    const m = new Map<number, BoardSlug>();
    (Object.entries(BOARD_ID) as [BoardSlug, number][]).forEach(([slug, bid]) =>
      m.set(bid, slug)
    );
    return m;
  }, []);
  const boardSlug = useMemo<BoardSlug | null>(
    () => (post ? idToSlug.get(post.board) ?? "free" : null),
    [post, idToSlug]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const detail = await fetchPostDetail(postId); // 제목/본문 등 공통 상세
        if (!alive) return;
        setPost(detail);

        // 공통 초기값
        const base = {
          title: String(detail.title ?? ""),
          content: String(detail.content ?? ""),
        };

        // 설문/깃이면 extra도 추가로 로드
        const slug = idToSlug.get(detail.board);
        if (slug === "survey") {
          const extra = await fetchSurveyExtra(postId); // { end_date, link }
          if (!alive) return;
          setInitial({
            ...base,
            formLink: extra.link,
            endDate: extra.end_date,
          });
        } else if (slug === "github") {
          const extra = await fetchGithubExtra(postId); // { link }
          if (!alive) return;
          setInitial({ ...base, repoUrl: extra.link });
        } else {
          setInitial(base);
        }
      } catch (e: any) {
        toast.push({
          message: e?.response?.data?.detail || e?.message || "불러오기 실패",
          type: "error",
        });
        navigate(-1);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId, idToSlug, navigate, toast]);

  // 권한 체크(작성자/관리자/모더레이터)
  const authorId = useMemo(() => {
    const inline = (post as any)?.user?.id;
    return String(
      inline ?? (post as any)?.user_id ?? (post as any)?.author_id ?? ""
    );
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

  if (loading || !boardSlug || !initial) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">게시글 수정</h1>
        <p className="mt-4 opacity-70">불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-2 text-black">
      {boardSlug === "survey" ? (
        <SurveyPostForm
          mode="edit"
          postId={postId}
          initial={{
            title: initial.title,
            content: initial.content,
            formLink: (initial as any).formLink,
            endDate: (initial as any).endDate,
          }}
          onCancel={() => navigate(-1)}
          onSubmitted={() => navigate(`/posts/${postId}`)}
        />
      ) : boardSlug === "github" ? (
        <GitRepoPostForm
          mode="edit"
          postId={postId}
          initial={{
            title: initial.title,
            content: initial.content,
            repoUrl: (initial as any).repoUrl,
          }}
          onCancel={() => navigate(-1)}
          onSubmitted={() => navigate(`/posts/${postId}`)}
        />
      ) : (
        <SharedPostForm
          mode="edit"
          board={boardSlug}
          postId={postId}
          initial={{ title: initial.title, content: initial.content }}
          onCancel={() => navigate(-1)}
          onSubmitted={() => navigate(`/posts/${postId}`)}
        />
      )}
    </div>
  );
}
