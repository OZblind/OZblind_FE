// 자유, 취업, 정보 게시판용 훅

import { useInfiniteQuery } from "@tanstack/react-query";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { formatYyMmDd } from "@utils/date";

export type Board = "free" | "jobs" | "info";
type Page = { items: FreeBoardItem[]; hasMore: boolean };
type Params = { sort?: "latest" | "popular"; tags?: string[]; q?: string };

// (모의) 페이지 상수
const PAGE_SIZE = 15;
const MAX_PAGES = 4;

function boardLabel(board: Board) {
  switch (board) {
    case "free":
      return "자유";
    case "jobs":
      return "취업";
    case "info":
      return "정보";
  }
}

function makeMockItems(
  board: Board,
  count: number,
  startIndex: number
): FreeBoardItem[] {
  const DAY = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseTs = today.getTime();
  const MOCK_TOTAL = PAGE_SIZE * MAX_PAGES;

  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;
    const d = new Date(baseTs - idx * DAY);
    return {
      id: `${board}-${idx + 1}`,
      authorId: `user-${((idx + 1) % 7) + 1}`,
      no: MOCK_TOTAL - idx, // 최신 글 번호가 더 큼(내림차순)
      title: `[${boardLabel(board)}] 샘플 게시글 ${idx + 1} — 반응형/무한스크롤 테스트`,
      author: `사용자${((idx + 1) % 7) + 1}`,
      dateText: formatYyMmDd(d),
      views: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 200),
    };
  });
}

async function fetchMockPage(board: Board, pageIndex: number): Promise<Page> {
  await new Promise((r) => setTimeout(r, 400));
  const start = pageIndex * PAGE_SIZE;
  const items = makeMockItems(board, PAGE_SIZE, start);
  const hasMore = pageIndex + 1 < MAX_PAGES;
  return { items, hasMore };
}

/** TODO: 실 API로 교체할 때 fetchMockPage만 실제 요청으로 바꾸면 됩니다. */
export function useBoardPosts(
  board: Board,
  params: Params = { sort: "latest", tags: [], q: "" }
) {
  return useInfiniteQuery<Page, Error>({
    queryKey: ["board-posts", board, params], // 보드/필터별로 캐시 분리
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchMockPage(board, pageParam as number),
    getNextPageParam: (last, all) => (last.hasMore ? all.length : undefined),
    refetchOnWindowFocus: false,
    retry: 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}

// 편의용 래퍼
export const useFreePosts = (p?: Params) => useBoardPosts("free", p);
export const useJobsPosts = (p?: Params) => useBoardPosts("jobs", p);
export const useInfoPosts = (p?: Params) => useBoardPosts("info", p);
