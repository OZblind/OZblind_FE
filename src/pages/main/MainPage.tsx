import { PostList, type FreeBoardItem } from "@src/components/Board/free";
import HotBoard from "@src/components/HotBoard/HotBoard";
import JobBannerTabs from "@src/components/JobBanner/JobBannerTabs";
import { useInfiniteScroll } from "@src/hooks/useInfiniteScroll";
import { formatYyMmDd, formatYyyyMmDdHms } from "@src/utils/date";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 15;
const MAX_PAGES = 4;
const MOCK_TOTAL = PAGE_SIZE * MAX_PAGES;

function makeMockItems(count: number, startIndex: number): FreeBoardItem[] {
  const DAY = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseTs = today.getTime();

  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;
    const d = new Date(baseTs - idx * DAY);
    return {
      id: `mock-${idx + 1}`,
      no: MOCK_TOTAL - idx, // 최신 글 번호가 더 큼(내림차순)
      title: `샘플 게시글 제목 ${
        idx + 1
      } — 반응형/테이블·카드/무한스크롤 테스트`,
      author: `사용자${((idx + 1) % 7) + 1}`,
      dateText: formatYyMmDd(d),
      views: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 200),
    };
  });
}

export default function MainPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<FreeBoardItem[]>(() =>
    makeMockItems(PAGE_SIZE, 0)
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<string>(
    formatYyyyMmDdHms(new Date())
  );

  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const hasMore = useMemo(() => page < MAX_PAGES, [page]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMoreRef.current) return;
    busyRef.current = true;
    if (mountedRef.current) setBusy(true);
    setErr(null);

    try {
      await new Promise((r) => setTimeout(r, 500)); // mock API 지연
      const nextPage = pageRef.current + 1;

      if (!mountedRef.current) return;
      setItems((prev) => [...prev, ...makeMockItems(PAGE_SIZE, prev.length)]);
      setPage(nextPage);
      pageRef.current = nextPage;
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    } finally {
      if (mountedRef.current) setBusy(false);
      busyRef.current = false;
    }
  }, []);

  // pageRef 동기화
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const { sentinelRef } = useInfiniteScroll({
    root: null,
    rootMargin: "1000px 0px",
    threshold: 0,
    disabled: busy || !hasMore || !!err, // 외부 가드
    onIntersect: loadMore,
  });

  const handleRefresh = () => setLastLoadedAt(formatYyyyMmDdHms(new Date()));
  const resetAll = () => {
    setPage(1);
    pageRef.current = 1;
    setItems(makeMockItems(PAGE_SIZE, 0));
    setBusy(false);
    busyRef.current = false;
    setErr(null);
    hasMoreRef.current = true;
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
  };
  return (
    <main>
      <div className="w-[800px] h-[180px]">
        <JobBannerTabs />
      </div>
      <HotBoard />
      <div className="w-[800px] pb-8">
        <p className="py-2 text-base-content/50">최신글</p>
        <div className="border border-base-300 py-2 rounded-md h-[320px] overflow-hidden">
          <PostList
            items={items}
            onItemClick={(id) => console.log("go detail:", id)}
            lastLoadedAt={lastLoadedAt}
            onRefresh={handleRefresh}
            isLoading={busy}
            isError={!!err}
            errorText={err ?? undefined}
            hasMore={hasMore}
            sentinelRef={sentinelRef}
            empty={{
              message: "조건에 맞는 게시글이 없습니다.",
              actionLabel: "초기화",
              onAction: resetAll,
            }}
          />
        </div>
      </div>
    </main>
  );
}
