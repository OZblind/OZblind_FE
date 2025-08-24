/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  fetchPostDetailCached,
  type PostDetail as ApiPostDetail,
} from "@api/posts";
import PostDetail from "@components/Post/PostDetail"; // 네가 준 컴포넌트
import type { PostMeta } from "@src/types/post";
import { fetchGithubExtra, fetchSurveyExtra } from "@src/api/posts.special";

const BOARD_ALIAS: Record<
  number,
  "free" | "jobs" | "info" | "survey" | "github"
> = {
  1: "free", // 자유게시판
  2: "info", // 정보게시판
  3: "jobs", //취업게시판
  4: "survey", // 설문게시판
  5: "github", // 깃헙게시판
};

type Extra = { formLink?: string; endDate?: string; repoUrl?: string };

export default function PostDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<ApiPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [extra, setExtra] = useState<Extra>({});

  // StrictMode/재렌더 가드: 같은 글에 대해 1회만 상세 호출
  const didFetchFor = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const key = String(id); // 캐시 키 정규화(문자열 고정)

    // 같은 postId로는 1회만
    if (didFetchFor.current === key) return;
    didFetchFor.current = key;

    let alive = true;
    setLoading(true);
    setErr(null);

    fetchPostDetailCached(key)
      .then((res) => {
        if (!alive) return;
        setData(res as ApiPostDetail);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message ?? "게시글을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  // 설문/깃헙 추가정보 GET
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    const alias = BOARD_ALIAS[data.board] ?? "free";
    (async () => {
      try {
        if (alias === "survey") {
          const ex = await fetchSurveyExtra(data.id);
          if (!cancelled) setExtra({ formLink: ex.link, endDate: ex.end_date });
        } else if (alias === "github") {
          const ex = await fetchGithubExtra(data.id);
          if (!cancelled) setExtra({ repoUrl: ex.link });
        } else {
          if (!cancelled) setExtra({});
        }
      } catch {
        if (!cancelled) setExtra({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  const postMeta: PostMeta | null = useMemo(() => {
    if (!data) return null;

    // API → UI 매핑
    const meta: any = {
      id: data.id,
      title: data.title,
      content: data.content, // HTML 그대로
      authorId: String(data.user ?? ""), // string 기대
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
      formLink: extra.formLink,
      endDate: extra.endDate,
      repoUrl: extra.repoUrl,
      // PostDetail → useAssignedTags 가 inlineUser로 재호출을 생략하게 하기 위해
      user: (data as any).user ?? null,
    };

    return meta as PostMeta;
  }, [data, extra]);

  if (loading) return <div className="p-4">불러오는 중...</div>;
  if (err) return <div className="p-4 text-red-500">{err}</div>;
  if (!postMeta) return <div className="p-4">게시글이 없습니다.</div>;

  return <PostDetail post={postMeta} />;
}
