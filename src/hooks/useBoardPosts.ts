// 자유, 취업, 정보 게시판용 훅

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts, type PostListItem } from "@api/posts";
import type { BoardSlug } from "@src/constants/boards";
import { LIST_SETTINGS } from "@src/constants/ui";
import type { SortValue } from "@src/types/sort";
import type { AxiosError } from "axios";

type FetchParams = NonNullable<Parameters<typeof fetchPosts>[0]>;
type Ordering = NonNullable<FetchParams["ordering"]>;
// "-created_at" | "created_at" | "-view_count" | "view_count"

const SORT_TO_ORDERING: Record<SortValue, Ordering> = {
  latest: "-created_at",
  oldest: "created_at",
  mostViewed: "-view_count",
  leastViewed: "view_count",
};

export function useBoardPosts(
  board: BoardSlug,
  opts?: {
    pageSize?: number;
    /** UI 정렬값(예: latest). 주면 API ordering으로 매핑됨 */
    sort?: SortValue;
    /** API ordering을 직접 지정하고 싶을 때(지정 시 sort보다 우선) */
    ordering?: Ordering;
    search?: string;
  }
) {
  const pageSize = opts?.pageSize ?? LIST_SETTINGS.ITEMS_PER_PAGE;

  // ordering이 오면 우선, 없으면 sort 매핑, 둘 다 없으면 최신순
  const computedOrdering: Ordering =
    opts?.ordering ??
    (opts?.sort ? SORT_TO_ORDERING[opts.sort] : "-created_at");

  return useInfiniteQuery<PostListItem[], unknown>({
    queryKey: [
      "board-posts",
      board,
      { pageSize, ordering: computedOrdering, search: opts?.search ?? "" },
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPosts({
        board,
        ordering: computedOrdering,
        page: pageParam as number, // DRF 1-base
        page_size: pageSize,
        search: opts?.search,
      }),

    // 마지막 페이지 길이가 pageSize보다 작으면 더 없음
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length + 1; // 1, 2, 3...
    },

    // 404는 "끝" 신호 → 재시도/에러 전환 방지
    retry: (failureCount, err) => {
      const ae = err as AxiosError | undefined;
      if (ae?.response?.status === 404) return false;
      return failureCount < 2;
    },

    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    // 필요하면 포커스 리패치 끄기:
    // refetchOnWindowFocus: false,
  });
}
