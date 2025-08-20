import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchPostDetail, type PostDetail as ApiPostDetail } from "@api/posts";
import PostDetail from "@components/Post/PostDetail"; // 네가 준 컴포넌트
import type { PostMeta } from "@src/types/post";

const BOARD_ALIAS: Record<
  number,
  "free" | "info" | "job" | "survey" | "github"
> = {
  1: "free", // 자유게시판
  2: "info", // 정보게시판
  3: "job", // 취업게시판
  4: "survey", // 설문게시판
  5: "github", // 깃헙게시판
};

export default function PostDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<ApiPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    fetchPostDetail(Number(id))
      .then((res) => setData(res))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => setErr(e?.message ?? "게시글을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const postMeta: PostMeta | null = useMemo(() => {
    if (!data) return null;

    // PostDetail(API) -> PostMeta(UI) 매핑
    return {
      id: data.id,
      title: data.title,
      content: data.content, // HTML 그대로
      authorId: String(data.user ?? ""), // PostDetail.tsx가 string 기대
      boardName: BOARD_ALIAS[data.board] ?? "free",
      views: data.view_count ?? 0,
      commentsCount: Array.isArray(data.root_comments)
        ? data.root_comments.length
        : 0,
      reactions: {
        like: data.like_count ?? 0,
        dislike: data.dislike_count ?? 0,
        bookmark: data.bookmark_count ?? 0,
      },
      createdAt: data.created_at,
      // 선택 필드들 (설문/깃헙 전용 카드가 있어도 빈 값이면 카드가 안 뜸)
      formLink: undefined,
      endDate: undefined,
      repoUrl: undefined,
    } as unknown as PostMeta;
  }, [data]);

  if (loading) return <div className="p-4">불러오는 중...</div>;
  if (err) return <div className="p-4 text-red-500">{err}</div>;
  if (!postMeta) return <div className="p-4">게시글이 없습니다.</div>;

  return <PostDetail post={postMeta} />;
}
