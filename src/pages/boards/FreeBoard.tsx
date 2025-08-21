// src/pages/boards/FreeBoard.tsx
import { useMemo, useState } from "react";
import {
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import PostList from "@components/Board/free/PostList";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyMmDd, formatYyyyMmDdHms } from "@utils/date";
import { urlForPost } from "@utils/urlForPost";
import { useNavigate } from "react-router-dom";

// 태그 목/타입 
import {
  profileToTagsMock,
  COHORTS,
  POSITIONS,
  type CohortLabel,
  type PositionLabel,
} from "@src/mocks/tags.mock";

/** 페이징 상수 (목) */
const PAGE_SIZE = 15;
const MAX_PAGES = 4;
type Page = { items: FreeBoardItem[]; hasMore: boolean };
const QUERY_KEY = ["free-posts-mock"] as const;

/** 목 아이템 생성: 최신글 번호가 더 큰 내림차순 */
function makeMockItems(count: number, startIndex: number): FreeBoardItem[] {
  const DAY = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseTs = today.getTime();
  const MOCK_TOTAL = PAGE_SIZE * MAX_PAGES;

  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;
    const d = new Date(baseTs - idx * DAY);
    return {
      id: `free-${idx + 1}`,
      no: MOCK_TOTAL - idx,
      title: `샘플 게시글 제목 ${idx + 1} — 반응형/테이블·카드/무한스크롤 테스트`,
      author: `사용자${((idx + 1) % 7) + 1}`,
      dateText: formatYyMmDd(d),
      views: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 200),
    };
  });
}

/** (목) 비동기 페이지 로더 */
async function fetchMockPage(pageIndex: number): Promise<Page> {
  await new Promise((r) => setTimeout(r, 400));
  const start = pageIndex * PAGE_SIZE;
  const items = makeMockItems(PAGE_SIZE, start);
  const hasMore = pageIndex + 1 < MAX_PAGES;
  return { items, hasMore };
}

export default function FreeBoard() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // 상단 “마지막 로드 시각 + 새로고침”
  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );
  const [forcedError, setForcedError] = useState<string | null>(null);

  // TanStack Query (무한 스크롤)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: QUERY_KEY,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => fetchMockPage(pageParam as number),
    getNextPageParam: (last, all) => (last.hasMore ? all.length : undefined),
    refetchOnWindowFocus: false,
    retry: 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  // 납작화
  const items = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  // 작성자 하단 보조 텍스트(“프론트엔드 11기”) — any 없이 안전하게
  const authorSubTextMap = useMemo(() => {
    const map = new Map<string, string>();
    const cohorts = COHORTS as readonly CohortLabel[];
    const positions = POSITIONS as readonly PositionLabel[];

    items.forEach((it, idx) => {
      const cohort: CohortLabel = cohorts[(idx + 1) % cohorts.length];
      const position: PositionLabel = positions[idx % positions.length];

      // 필요 시 태그 객체 활용 가능 (UI는 텍스트만 사용)
      profileToTagsMock(cohort, position);

      const positionText = position === "프론트" ? "프론트엔드" : position;
      map.set(it.author, `${positionText} ${cohort}`);
    });
    return map;
  }, [items]);

  // 본문 내 스크롤 루트
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  // 섹션 높이를 h-[calc(100vh-200px)]로 줄였으니 rootMargin도 400px로 조정
  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "400px 0px",
    threshold: 0,
    disabled: isFetchingNextPage || !hasNextPage || !!forcedError || isError,
    onIntersect: async () => {
      await fetchNextPage();
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    },
  });

  // 상단 바 액션
  const handleRefresh = () => {
    setForcedError(null);
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    refetch();
  };
  const resetAll = () => {
    setForcedError(null);
    qc.removeQueries({ queryKey: QUERY_KEY });
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
  };
  const clearItems = () => {
    const emptyData: InfiniteData<Page> = {
      pages: [{ items: [], hasMore: false }],
      pageParams: [0],
    };
    qc.setQueryData<InfiniteData<Page>>(QUERY_KEY, emptyData);
    setForcedError(null);
  };
  const toggleError = () =>
    setForcedError((e) => (e ? null : "의도적 테스트 에러"));

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">자유 게시판 — 본문 리스트</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={resetAll}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            초기화
          </button>
          <button
            onClick={clearItems}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            비우기(Empty)
          </button>
          <button
            onClick={toggleError}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            에러 상태 토글
          </button>
        </div>
      </header>

      {/* ✅ 요구한 섹션 클래스 */}
      <section
        ref={setRootEl}
        className="rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-auto"
      >
        <div className="text-xs opacity-70 mb-2">
          hasMore: {String(!!hasNextPage)} / busy: {String(isFetchingNextPage)}{" "}
          / items: {items.length}
          {(isError || !!forcedError) && (
            <span className="ml-2 text-red-500">
              | error: {forcedError ?? (error as Error)?.message ?? "에러"}
            </span>
          )}
        </div>

        <PostList
          items={items}
          onItemClick={(id) => navigate(urlForPost.postDetail("free", id))}
          topBar={{
            boardName: "자유 게시판",
            onOpenSort: () => console.log("정렬 필터 열기"),
            onOpenTag: () => console.log("태그 필터 열기"),
            onWrite: () => navigate(urlForPost.postCreate("free")),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={isFetchingNextPage}
          isError={!!forcedError || isError}
          errorText={forcedError ?? (error as Error)?.message}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          // 스크롤 컨테이너를 루트로 지정 (필수)
          scrollRootRef={setRootEl}
          empty={{ message: "등록된 게시글이 없습니다." }}
          // ⬇️ 작성자 하단 보조 텍스트(“프론트엔드 11기”) 표시용 슬롯
          // PostList에 아래 prop이 없다면, 선택 prop으로 추가해 주세요.
          renderAuthorExtra={(author: string) => (
            <span className="block text-xs opacity-70">
              {authorSubTextMap.get(author)}
            </span>
          )}
        />
      </section>
    </div>
  );
}
