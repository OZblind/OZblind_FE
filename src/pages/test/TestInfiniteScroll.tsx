import { useState } from "react";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";

export default function InfiniteScrollSmokeTest() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<string[]>(
    Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
  );
  const [hasMore, setHasMore] = useState(true);
  const [busy, setBusy] = useState(false);

  const { sentinelRef } = useInfiniteScroll({
    root: null,
    rootMargin: "600px 0px",
    threshold: 0,
    disabled: busy || !hasMore,
    onIntersect: () => {
      setBusy(true);
      console.log("[IO] intersect → fetch page", page + 1);
      // 네트워크 지연 흉내
      setTimeout(() => {
        const next = page + 1;
        setItems((prev) => [
          ...prev,
          ...Array.from(
            { length: 20 },
            (_, i) => `Item ${prev.length + i + 1}`
          ),
        ]);
        setPage(next);
        // 4페이지까지만 있다고 가정
        if (next >= 4) setHasMore(false);
        setBusy(false);
      }, 500);
    },
  });

  return (
    <div className="p-4 space-y-2">
      <div className="text-sm opacity-70">
        page: {page} / hasMore: {String(hasMore)} / busy: {String(busy)}
      </div>

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="p-3 rounded-lg bg-base-200">
            {it}
          </li>
        ))}
      </ul>

      {/* 관찰용 앵커 */}
      <ScrollSentinel ref={sentinelRef} />

      {!hasMore && <div className="mt-4 opacity-70">모두 불러왔습니다.</div>}
      {busy && <div className="mt-4">불러오는 중…</div>}
    </div>
  );
}
