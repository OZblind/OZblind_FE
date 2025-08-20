import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PostList from "@components/Board/free/PostList";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyMmDd, formatYyyyMmDdHms } from "@utils/date";
import { urlForPost } from "@utils/urlForPost";
import { useNavigate } from "react-router-dom";

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
      title: `샘플 게시글 제목 ${idx + 1} — 반응형/테이블·카드/무한스크롤 테스트`,
      author: `사용자${((idx + 1) % 7) + 1}`,
      dateText: formatYyMmDd(d),
      views: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 200),
    };
  });
}

export default function TestFreeBoardList() {
  const navigate = useNavigate();

  const currentBoard: "free" | "jobs" | "info" = "free";

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

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

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
    root: rootEl,
    rootMargin: "600px 0px",
    threshold: 0,
    disabled: busy || !hasMore || !!err, // 외부 가드
    onIntersect: loadMore,
  });

  const handleRefresh = () => setLastLoadedAt(formatYyyyMmDdHms(new Date()));
  const clearItems = () => setItems([]);
  const toggleError = () => setErr((e) => (e ? null : "의도적 테스트 에러"));
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
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">
          Free/Job/Info 리스트 본문 — 테스트
        </h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={resetAll}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={clearItems}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            비우기(Empty)
          </button>
          <button
            type="button"
            onClick={toggleError}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            에러 상태 토글
          </button>
        </div>
      </header>

      {/* ❗️ 본문 내 스크롤 적용 시 부모(wrapper)엔 높이가 있어야 함 ❗️ */}
      <section className="rounded-xl border p-3 pb-8 h-[calc(100vh-100px)] overflow-hidden">
        <div className="text-xs opacity-70 mb-2">
          page: {page} / hasMore: {String(hasMore)} / busy: {String(busy)} /
          items: {items.length}
          {err && <span className="ml-2 text-red-500">| error: {err}</span>}
        </div>

        <PostList
          items={items}
          onItemClick={(id) => navigate(urlForPost.postDetail("free", id))} // id에 해당하는 게시글 상세 페이지로
          topBar={{
            boardName: "자유 게시판",
            onOpenSort: () => console.log("정렬 필터 열기"),
            onOpenTag: () => console.log("태그 필터 열기"),
            onWrite: () => navigate(urlForPost.postCreate(currentBoard)), // 자유게시판으로 설정해둠
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={busy}
          isError={!!err}
          errorText={err ?? undefined}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          empty={{
            message: "조건에 맞는 게시글이 없습니다.",
            actionLabel: "초기화",
            onAction: resetAll,
          }}
        />
      </section>
    </div>
  );
}
