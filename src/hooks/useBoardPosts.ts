// 자유, 취업, 정보 게시판용 훅

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts, type PostListItem } from "@api/posts";
import type { BoardSlug } from "@src/constants/boards";
import { LIST_SETTINGS } from "@src/constants/ui";
import type { AxiosError } from "axios";
import type { SortValue } from "@src/types/sort";
import type { TagFilter } from "@src/types/tag";

type UseBoardPostsOpts = {
  pageSize?: number;
  sort: SortValue;
  search?: string;
  tags?: TagFilter; // { tagClass?: "FE"|"BE"; cohort?: number }
};

type FetchParams = NonNullable<Parameters<typeof fetchPosts>[0]>;
type Ordering = NonNullable<FetchParams["ordering"]>;

// UI 정렬 → API ordering
const SORT_TO_ORDERING: Record<string, Ordering> = {
  latest: "-created_at",
  oldest: "created_at",
  // 과거/현재 키 혼재 가능성 대비(둘 다 매핑)
  most_viewed: "-view_count",
  least_viewed: "view_count",
  mostViewed: "-view_count",
  leastViewed: "view_count",
};

export function useBoardPosts(board: BoardSlug, opts?: UseBoardPostsOpts) {
  const pageSize = opts?.pageSize ?? LIST_SETTINGS.ITEMS_PER_PAGE;
  const sort: SortValue = opts?.sort ?? "latest";
  const search = opts?.search?.trim() || undefined;
  const tags = opts?.tags;

  const ordering: Ordering = SORT_TO_ORDERING[sort] ?? "-created_at";

  return useInfiniteQuery<PostListItem[], unknown>({
    queryKey: [
      "board-posts",
      board,
      {
        pageSize,
        ordering,
        search,
        tags, // { tagClass, cohort }
      },
    ],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      fetchPosts({
        board,
        page: pageParam as number, // DRF 1-base
        page_size: pageSize,
        ordering,
        search, // undefined면 쿼리에 안 붙음
        user_tag_class: tags?.tagClass,
        user_tag_number:
          typeof tags?.cohort === "number" ? tags!.cohort : undefined,
      } as FetchParams),

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
    // refetchOnWindowFocus: false,
  });
}
