import CompanyLogo from "./CompanyLogo";
import type { JobCard } from "@src/types/job";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  items: JobCard[];
  hasMore?: boolean;
  onEndReached?: () => void; // 끝에서 더 보기
};

// 컨테이너 너비 → 화면당 카드 개수
function calcItemsPerPage(width: number): number {
  if (width >= 1536) return 6;
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 480) return 2;
  return 1;
}

export default function Carousel({
  items,
  hasMore = false,
  onEndReached,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState<number>(4);
  const [page, setPage] = useState<number>(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeItems: JobCard[] = Array.isArray(items) ? items : [];
  const total = safeItems.length;

  // 레이아웃 계산
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setPerPage(calcItemsPerPage(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // perPage가 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(0);
  }, [perPage]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = page * perPage;

  const visible = useMemo(
    () => safeItems.slice(start, start + perPage),
    [safeItems, start, perPage]
  );

  const atEndPage = page >= totalPages - 1;
  const prevDisabled = page <= 0;
  // 끝이고 더 없으면 비활성, 더 있으면 활성(누르면 onEndReached)
  const nextDisabled = atEndPage && !hasMore;

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));

  const handleNext = () => {
    if (atEndPage) {
      // 끝인데 더 로드 가능 → 상위에 요청
      if (hasMore && onEndReached) onEndReached();
      // onEndReached 이후 items가 늘어나면 total/totalPages가 변해 다음 클릭부터 자연스럽게 이동됨
      return;
    }
    setPage((p) => Math.min(totalPages - 1, p + 1));
  };

  return (
    <div className="relative" ref={wrapRef}>
      {total === 0 ? (
        <div className="grid h-48 place-items-center">공고 없음</div>
      ) : (
        <>
          {/* 좌우 화살표 */}
          <button
            type="button"
            className="btn btn-circle btn-sm absolute left-1 top-1/2 z-10 -translate-y-1/2"
            onClick={handlePrev}
            disabled={prevDisabled}
            aria-label="이전"
          >
            ◀
          </button>
          <button
            type="button"
            className="btn btn-circle btn-sm absolute right-1 top-1/2 z-10 -translate-y-1/2"
            onClick={handleNext}
            disabled={nextDisabled}
            aria-label="다음"
          >
            ▶
          </button>

          {/* 그리드로 균등 분할 */}
          <div className="p-2">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))`,
              }}
            >
              {visible.map((j) => (
                <article
                  key={j.id}
                  className="h-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <CompanyLogo src={j.logo} company={j.company} size={36} />
                    <div className="min-w-0">
                      <div className="truncate text-xs text-gray-500">
                        {j.company}
                      </div>
                      <a
                        href={j.url}
                        className="block truncate font-semibold hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {j.title}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate">
                      {j.location ?? (j.remote ? "Remote" : "")}
                    </span>
                    <time>{j.publishedAt?.slice(0, 10)}</time>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 페이지/더보기 상태 안내 */}
          <div className="mt-1 text-center text-xs opacity-70">
            {page + 1} / {totalPages}
          </div>
        </>
      )}
    </div>
  );
}

