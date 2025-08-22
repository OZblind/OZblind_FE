import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GithubListItem } from "@components/Board/github/GithubList";
import type { PostListItem } from "@api/posts";
import { mapToGithubListItem } from "@src/features/posts/list/githubAdapter";

const GITHUB_BOARD_ID = 5;

/** 응답/가드 타입 */
type PostsListResponse = {
  results: PostListItem[];
  next?: string;
  totalCount?: number;
};
type GithubPostsPage = { items: PostListItem[]; hasMore: boolean };

type AnyObj = Record<string, unknown>;
function isObj(v: unknown): v is AnyObj {
  return typeof v === "object" && v !== null;
}
function isPostsListResponse(v: unknown): v is PostsListResponse {
  return isObj(v) && Array.isArray(v.results);
}

/** 목록 호출 (page는 1-based) */
async function fetchGithubPosts(page: number): Promise<GithubPostsPage> {
  const url = new URL("/api/posts", window.location.origin);
  url.searchParams.set("page", String(page));
  url.searchParams.set("board_id", String(GITHUB_BOARD_ID));

  const res = await fetch(url.toString(), {
    credentials: "include", // TODO[AUTH]: 전역 규약으로 조정
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "GitHub 게시판 목록을 불러오지 못했습니다.");
  }

  const json: unknown = await res.json();
  if (!isPostsListResponse(json)) {
    // 스키마가 다르면 빈 페이지로 처리
    return { items: [], hasMore: false };
  }

  const items = json.results;

  const hasMore = items.length > 0;
  return { items, hasMore };
}

export const GITHUB_POSTS_KEY = ["github-posts", GITHUB_BOARD_ID] as const;

export function useGithubPosts() {
  return useInfiniteQuery({
    queryKey: GITHUB_POSTS_KEY,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchGithubPosts(pageParam as number),
    getNextPageParam: (lastPage, _pages, lastParam) =>
      lastPage.hasMore ? (lastParam as number) + 1 : undefined,
  });
}

/** 페이지 → GithubList에 바로 넣을 items (어댑터 적용) */
export function useGithubListItems(
  data?: InfiniteData<GithubPostsPage>
): GithubListItem[] {
  return useMemo(() => {
    const flat: PostListItem[] = data?.pages.flatMap((p) => p.items) ?? [];
    return flat.map((it) => mapToGithubListItem(it));
  }, [data]);
}
