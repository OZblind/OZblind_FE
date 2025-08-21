import CompanyLogo from "./CompanyLogo";
import type { JobCard } from "@src/types/job";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  items: JobCard[];
  hasMore?: boolean;
  onEndReached?: () => void;
};

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

  const safeItems: JobCard[] = Array.isArray(items) ? items : [];
  const total = safeItems.length;

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
  const nextDisabled = atEndPage && !hasMore;

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));

  const handleNext = () => {
    if (atEndPage) {
      if (hasMore && onEndReached) onEndReached();
      return;
    }
    setPage((p) => Math.min(totalPages - 1, p + 1));
  };

  return (
    <div className="relative" ref={wrapRef}>
      {total === 0 ? (
        <div className="grid h-48 place-items-center text-neutral-content">
          공고가 없습니다
        </div>
      ) : (
        <>
          {/* 좌우 화살표 - z-index 낮춤 */}
          <button
            type="button"
            className="btn btn-circle btn-sm absolute -left-6 top-14 z-[1]"
            onClick={handlePrev}
            disabled={prevDisabled}
            aria-label="이전"
          >
            ◀
          </button>
          <button
            type="button"
            className="btn btn-circle btn-sm absolute -right-6 top-14 z-[1]"
            onClick={handleNext}
            disabled={nextDisabled}
            aria-label="다음"
          >
            ▶
          </button>

          {/* 카드 그리드 */}
          <div className="px-4">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))`,
              }}
            >
              {visible.map((j) => (
                <a
                  key={j.id}
                  href={j.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <article className="h-32 rounded-lg border border-base-300 bg-base-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                    <div className="mb-3 flex items-center gap-3">
                      <CompanyLogo src={j.logo} company={j.company} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs text-neutral-content mb-1">
                          {j.company || "Unknown Company"}
                        </div>
                        <div
                          className="font-semibold text-base-content text-sm leading-tight overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {j.title}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between text-xs text-neutral-content">
                      <span className="truncate flex-1 mr-2">
                        {j.location || (j.remote ? "Remote" : "위치 미정")}
                      </span>
                      {j.publishedAt && (
                        <time className="flex-shrink-0">
                          {(() => {
                            if (/^\d+$/.test(j.publishedAt)) {
                              const timestamp = parseInt(j.publishedAt) * 1000;
                              return new Date(timestamp)
                                .toISOString()
                                .slice(0, 10);
                            }
                            return j.publishedAt.slice(0, 10);
                          })()}
                        </time>
                      )}
                    </div>
                  </article>
                </a>
              ))}
            </div>
          </div>

          {/* 페이지 정보 */}
          <div className="mt-2 text-center text-xs text-neutral-content">
            {page + 1} / {totalPages}
          </div>
        </>
      )}
    </div>
  );
}
