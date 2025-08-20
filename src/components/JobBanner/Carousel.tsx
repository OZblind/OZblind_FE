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
  if (width >= 480) return 3; // 2에서 3으로 변경
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
        <div className="grid h-48 place-items-center text-gray-500">
          공고가 없습니다
        </div>
      ) : (
        <>
          {/* 좌우 화살표 - 카드와 더 떨어뜨리기 */}
          <button
            type="button"
            className="btn btn-circle btn-sm absolute -left-6 top-14 z-10"
            onClick={handlePrev}
            disabled={prevDisabled}
            aria-label="이전"
          >
            ◀
          </button>
          <button
            type="button"
            className="btn btn-circle btn-sm absolute -right-6 top-14 z-10"
            onClick={handleNext}
            disabled={nextDisabled}
            aria-label="다음"
          >
            ▶
          </button>

          {/* 카드 그리드 */}
          <div className="p-2 mx-6">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))`,
              }}
            >
              {visible.map((j) => (
                <article
                  key={j.id}
                  className="h-32 rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* 회사 로고와 정보 */}
                  <div className="flex items-center gap-3 mb-3">
                    <CompanyLogo src={j.logo} company={j.company} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {j.company || "Unknown"}
                      </div>
                      <a
                        href={j.url}
                        className="block font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                        title={j.title}
                      >
                        <div className="line-clamp-2 text-sm leading-tight">
                          {j.title}
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* 하단 정보 */}
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate max-w-20">
                      {j.location ?? (j.remote ? "Remote" : "위치 미정")}
                    </span>
                    {j.publishedAt && <time>{j.publishedAt.slice(0, 10)}</time>}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 페이지 정보 - 기존과 동일 */}
          <div className="mt-1 text-center text-xs text-gray-500">
            {page + 1} / {totalPages}
          </div>
        </>
      )}
    </div>
  );
}
