import { useInfiniteQuery } from "@tanstack/react-query";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { formatYyMmDd } from "@utils/date";

// (모의) 페이지 상수
const PAGE_SIZE = 15;
const MAX_PAGES = 4;

function makeMockItems(count: number, startIndex: number): FreeBoardItem[] {
  const DAY = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseTs = today.getTime();
  const MOCK_TOTAL = PAGE_SIZE * MAX_PAGES;

  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;
    const d = new Date(baseTs - idx * DAY);
    return {
      id: `free-${idx + 1}`,
      no: MOCK_TOTAL - idx, // 최신 글 번호가 더 큼(내림차순)
      title: `샘플 게시글 제목 ${idx + 1} — 반응형/테이블·카드/무한스크롤 테스트`,
      author: `사용자${((idx + 1) % 7) + 1}`,
      dateText: formatYyMmDd(d),
      views: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 200),
    };
  });
}

async function fetchMockPage(pageIndex: number) {
  await new Promise((r) => setTimeout(r, 400));
  const start = pageIndex * PAGE_SIZE;
  const items = makeMockItems(PAGE_SIZE, start);
  const hasMore = pageIndex + 1 < MAX_PAGES;
  return { items, hasMore };
}

/** TODO: 여기는 나중에 실 API로 교체 */
export function useFreePostsMock() {
  return useInfiniteQuery({
    queryKey: ["free-posts-mock"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => fetchMockPage(pageParam as number),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    refetchOnWindowFocus: false,
    retry: 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}
