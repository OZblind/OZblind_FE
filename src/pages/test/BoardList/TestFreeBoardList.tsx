import { useMemo, useState } from "react";
import PostList from "@components/Board/free/PostList";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";

/** 샘플 아이템 생성기 */
function makeMockItems(count: number, startIndex: number): FreeBoardItem[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const n = startIndex + i + 1;
    return {
      id: `mock-${n}`,
      no: n,
      title: `샘플 게시글 제목 ${n} — 반응형/테이블·카드/무한스크롤 테스트`,
      author: `사용자${(n % 7) + 1}`,
      dateText: new Date(now - n * 60 * 60 * 1000).toLocaleString(), // n시간 전
      views: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 200),
    };
  });
}

export default function TestFreeBoardList() {
  const PAGE_SIZE = 15;
  const MAX_PAGES = 4;

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<FreeBoardItem[]>(() =>
    makeMockItems(PAGE_SIZE, 0)
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | string>(
    new Date().toLocaleString()
  );

  const hasMore = useMemo(() => page < MAX_PAGES, [page]);

  const loadMore = async () => {
    if (busy || !hasMore) return;
    setBusy(true);
    setErr(null);

    // 네트워크 지연 흉내
    await new Promise((r) => setTimeout(r, 500));

    const nextPage = page + 1;
    setItems((prev) => [...prev, ...makeMockItems(PAGE_SIZE, prev.length)]);
    setPage(nextPage);
    setLastLoadedAt(new Date().toLocaleString());
    setBusy(false);
  };

  const { sentinelRef } = useInfiniteScroll({
    root: null,
    rootMargin: "600px 0px",
    threshold: 0,
    disabled: busy || !hasMore || !!err,
    onIntersect: loadMore,
  });

  const handleRefresh = () => {
    // UI 확인용: 타임스탬프만 갱신(실서비스에선 refetch)
    setLastLoadedAt(new Date().toLocaleString());
  };

  // 테스트 컨트롤(빈/에러/리셋)
  const clearItems = () => setItems([]);
  const toggleError = () => setErr((e) => (e ? null : "의도적 테스트 에러"));
  const resetAll = () => {
    setPage(1);
    setItems(makeMockItems(PAGE_SIZE, 0));
    setBusy(false);
    setErr(null);
    setLastLoadedAt(new Date().toLocaleString());
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
            비우기(Empty 상태)
          </button>
          <button
            type="button"
            onClick={toggleError}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            에러 토글
          </button>
        </div>
      </header>

      <section className="rounded-xl border p-3">
        <div className="text-xs opacity-70 mb-2">
          page: {page} / hasMore: {String(hasMore)} / busy: {String(busy)} /
          items: {items.length}
          {err && <span className="ml-2 text-error">| error: {err}</span>}
        </div>

        <PostList
          items={items}
          onItemClick={(id) => console.log("go detail:", id)}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={busy}
          isError={!!err}
          errorText={err ?? undefined}
          sentinelRef={sentinelRef}
        />
      </section>
    </div>
  );
}
