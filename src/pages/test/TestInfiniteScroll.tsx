import { useMemo, useRef, useState } from "react";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { useResponsivePageSize } from "@hooks/useResponsivePageSize";
import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";

export default function InfiniteScrollSmokeTest() {
  const containerRef = useRef<HTMLDivElement>(null);

  // ====== PAGE_SIZE 선택 (3 중 택 1) ======
  // 1) 상수 모드 (간단/안정)
  // const PAGE_SIZE = 20;

  // 2) 반응형 모드 (컨테이너 너비 기준, 첫 계산값 고정 X)
  // const PAGE_SIZE = useResponsivePageSize({ containerRef });

  // 3) 반응형 + 첫 계산값 고정(리사이즈 무시)
  const PAGE_SIZE = useResponsivePageSize({
    containerRef,
    fixOnFirst: true,
    // 필요 시 breakpoints 커스터마이즈 가능
    // breakpoints: [
    //   { maxWidth: 480, size: 8 },
    //   { maxWidth: 768, size: 12 },
    //   { maxWidth: 1024, size: 16 },
    //   { maxWidth: Infinity, size: 24 },
    // ],
  });

  const MAX_PAGES = 4;

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<string[]>(() =>
    Array.from({ length: PAGE_SIZE }, (_, i) => `Item ${i + 1}`)
  );
  const [busy, setBusy] = useState(false);

  const hasMore = useMemo(() => page < MAX_PAGES, [page]);

  const { sentinelRef } = useInfiniteScroll({
    root: null, // 또는 containerRef.current (내부 스크롤 컨테이너로 테스트)
    rootMargin: "600px 0px",
    threshold: 0,
    disabled: busy || !hasMore,
    // Promise 핸들러: 훅이 resolve까지 in-flight 락 유지
    onIntersect: async () => {
      if (busy || !hasMore) return; // 소비측 이중 가드
      setBusy(true);
      console.log("[IO] intersect → fetch page", page + 1);

      // 네트워크 지연 흉내
      await new Promise((r) => setTimeout(r, 500));

      const next = page + 1;
      setItems((prev) => [
        ...prev,
        ...Array.from(
          { length: PAGE_SIZE },
          (_, i) => `Item ${prev.length + i + 1}`
        ),
      ]);
      setPage(next);
      setBusy(false);
    },
  });

  return (
    <div className="p-4 space-y-2">
      <div className="text-sm opacity-70">
        page: {page} / hasMore: {String(hasMore)} / busy: {String(busy)} /
        PAGE_SIZE: {PAGE_SIZE}
      </div>

      {/* 컨테이너 스크롤을 시험하려면 아래 div에 h-[60vh] + overflow-auto를 주고
          useInfiniteScroll의 root에 containerRef.current를 넣으세요. */}
      <div ref={containerRef}>
        <ul className="space-y-2">
          {items.map((it, idx) => (
            <li key={it} className="p-3 rounded-lg bg-base-200">
              {/* 가변 높이 샘플: 3개마다 긴 아이템으로 레이아웃 흔들림 검증 */}
              <div className={idx % 3 === 0 ? "min-h-24" : ""}>{it}</div>
            </li>
          ))}
        </ul>

        {/* 관찰용 앵커 */}
        <ScrollSentinel innerRef={sentinelRef} />

        {!hasMore && <div className="mt-4 opacity-70">모두 불러왔습니다.</div>}
        {busy && <div className="mt-4">불러오는 중…</div>}
      </div>
    </div>
  );
}
