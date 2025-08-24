// 자유, 취업, 정보 게시판용 훅

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts, type PostListItem } from "@api/posts";
import type { BoardSlug } from "@src/constants/boards";
import { LIST_SETTINGS } from "@src/constants/ui";
import type { AxiosError } from "axios";

export function useBoardPosts(
  board: BoardSlug,
  opts?: {
    pageSize?: number;
    search?: string;
  }
) {
  const pageSize = opts?.pageSize ?? LIST_SETTINGS.ITEMS_PER_PAGE;

  return useInfiniteQuery<PostListItem[], unknown>({
    queryKey: ["board-posts", board, { pageSize, search: opts?.search ?? "" }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPosts({
        board,
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
