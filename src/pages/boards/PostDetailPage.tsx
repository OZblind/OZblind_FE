/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  fetchPostDetailSingleflight,
  type PostDetail as ApiPostDetail,
} from "@api/posts";
import PostDetail from "@components/Post/PostDetail"; // 네가 준 컴포넌트
import type { PostMeta } from "@src/types/post";
import { fetchGithubExtra, fetchSurveyExtra } from "@src/api/posts.special";
import { BOARD_DISPLAY_NAME } from "@constants/boardDisplay";
import {
  filterDeletedThread,
  normalizeDate,
  toClientFromPostDetail,
} from "@src/api/comments";

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

  const initialComments: any[] = useMemo(() => {
    if (!data) return [];
    const roots = Array.isArray((data as any).root_comments)
      ? (data as any).root_comments
      : [];
    const tree = roots.map(toClientFromPostDetail);
    return filterDeletedThread(tree, true);
  }, [data]);

  useEffect(() => {
    if (!id) return;
    const key = String(id);
    if (didFetchFor.current === key) return; // 같은 id로 2번 실행 방지
    didFetchFor.current = key;

    let alive = true;
    setLoading(true);
    setErr(null);
    fetchPostDetailSingleflight(key)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((e: any) => {
        if (alive) setErr(e?.message ?? "게시글을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setLoading(false);
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

    // 1) board id -> slug(alias)
    const alias =
      (BOARD_ALIAS as Record<number, keyof typeof BOARD_DISPLAY_NAME>)[
        data.board
      ] ?? "free";

    // 2) slug -> 화면 표기용 이름
    const boardTitle = BOARD_DISPLAY_NAME[alias] ?? "게시판";
    const commentsCount = Array.isArray(data.root_comments)
      ? data.root_comments.length
      : 0;

    const x = extra ?? {};

    const toInt = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    // PostDetail(API) -> PostMeta(UI) 매핑
    return {
      id: data.id,
      title: data.title,
      content: data.content ?? "", // HTML 그대로
      authorId: String(data.user ?? ""), // PostDetail.tsx가 string 기대
      boardName: boardTitle,
      boardSlug: alias,

      // 숫자 필드는 전부 Number()로 고정
      views: toInt(data.view_count),
      commentsCount,

      reactions: {
        like: toInt(data.like_count),
        // 백엔드 필드명이 다양할 수 있으니 모두 대비
        dislike: toInt(
          (data as any).dislike_count ??
            (data as any).downvote_count ??
            (data as any).hate_count ??
            0
        ),
        bookmark: toInt(data.bookmark_count),
      },
      createdAt: normalizeDate(
        (data as any).created_at ?? (data as any).createdAt
      ),

      // 선택 필드들 (설문/깃헙 전용)
      formLink: x?.formLink ?? null,
      endDate: x?.endDate ?? null,
      repoUrl: x?.repoUrl ?? null,

      // useAssignedTags가 inlineUser로 재호출을 생략하게 하기 위해
      user: (data as any).user ?? null,
    } as unknown as PostMeta;
  }, [data, extra]);

  if (loading) return <div className="p-4">불러오는 중...</div>;
  if (err) return <div className="p-4 text-red-500">{err}</div>;
  if (!postMeta) return <div className="p-4">게시글이 없습니다.</div>;

  return <PostDetail post={postMeta} initialComments={initialComments} />;
}
