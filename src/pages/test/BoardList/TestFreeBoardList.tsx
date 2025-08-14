import { useMemo, useState } from "react";
import PostList from "@components/Board/free/PostList";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyMmDd, formatYyyyMmDdHms } from "@utils/date";
import { BoardTopBar } from "@components/Board/common/BoardTopBar";

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
      no: idx + 1,
      title: `샘플 게시글 제목 ${idx + 1} — 반응형/테이블·카드/무한스크롤 테스트`,
      author: `사용자${((idx + 1) % 7) + 1}`,
      dateText: formatYyMmDd(d),
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
  const [lastLoadedAt, setLastLoadedAt] = useState<string>(
    formatYyyyMmDdHms(new Date())
  );

  const hasMore = useMemo(() => page < MAX_PAGES, [page]);

  const loadMore = async () => {
    if (busy || !hasMore) return;
    setBusy(true);
    setErr(null);
    await new Promise((r) => setTimeout(r, 500));
    const nextPage = page + 1;
    setItems((prev) => [...prev, ...makeMockItems(PAGE_SIZE, prev.length)]);
    setPage(nextPage);
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    setBusy(false);
  };

  const { sentinelRef } = useInfiniteScroll({
    root: null,
    rootMargin: "600px 0px",
    threshold: 0,
    disabled: busy || !hasMore || !!err,
    onIntersect: loadMore,
  });

  const handleRefresh = () => setLastLoadedAt(formatYyyyMmDdHms(new Date()));

  const clearItems = () => setItems([]);
  const toggleError = () => setErr((e) => (e ? null : "의도적 테스트 에러"));
  const resetAll = () => {
    setPage(1);
    setItems(makeMockItems(PAGE_SIZE, 0));
    setBusy(false);
    setErr(null);
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      {/* 🧱 상단 한 줄: 게시판명 · 정렬/태그 아이콘 · 글쓰기 */}
      <BoardTopBar
        boardName="자유 게시판"
        onOpenSort={() => console.log("정렬 필터 열기")}
        onOpenTag={() => console.log("태그 필터 열기")}
        onWrite={() => console.log("글쓰기 이동")}
      />

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
            에러 상태 토글(테스트용)
          </button>
        </div>
      </header>

      <section className="rounded-xl border p-3">
        <div className="text-xs opacity-70 mb-2">
          page: {page} / hasMore: {String(hasMore)} / busy: {String(busy)} /
          items: {items.length}
          {err && <span className="ml-2 text-red-500">| error: {err}</span>}
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
