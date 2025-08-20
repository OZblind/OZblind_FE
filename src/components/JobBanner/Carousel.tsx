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
        <div className="grid h-48 place-items-center text-gray-500">
          공고가 없습니다
        </div>
      ) : (
        <>
          {/* 좌우 화살표 - 카드에 더 가깝게 */}
          <button
            type="button"
            className="btn btn-circle btn-sm absolute -left-6 top-16 z-10"
            onClick={handlePrev}
            disabled={prevDisabled}
            aria-label="이전"
          >
            ◀
          </button>
          <button
            type="button"
            className="btn btn-circle btn-sm absolute -right-6 top-16 z-10"
            onClick={handleNext}
            disabled={nextDisabled}
            aria-label="다음"
          >
            ▶
          </button>

          {/* 카드 그리드 - 여백 추가 */}
          <div className="px-4">
            <div
              className="grid gap-2"
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
                  <article className="relative h-32 rounded-lg border border-base-300 bg-base-200 p-3 hover:shadow-md transition-shadow cursor-pointer">
                    {/* 상단: 회사 로고와 이니셜 */}
                    <div className="flex items-center justify-between mb-1">
                      <CompanyLogo src={j.logo} company={j.company} size={22} />
                      <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-xs font-bold text-primary-content">
                        {(j.company || "C")[0].toUpperCase()}
                      </div>
                    </div>

                    {/* 회사명 */}
                    <div className="text-xs text-base-content mb-1">
                      {j.company || "Unknown Company"}
                    </div>

                    {/* 제목 */}
                    <div className="h-10 mb-1 overflow-hidden">
                      <div className="font-medium text-base-content text-sm leading-tight">
                        <div
                          className="overflow-hidden text-ellipsis"
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

                    {/* 하단 정보 */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-neutral-content">
                      <span>
                        {j.remote ? "Remote" : j.location || "위치 미정"}
                      </span>
                      {j.publishedAt && (
                        <time>{j.publishedAt.slice(0, 10)}</time>
                      )}
                    </div>
                  </article>
                </a>
              ))}
            </div>
          </div>

          {/* 페이지 정보 */}
          <div className="mt-1 text-center text-xs text-gray-500">
            {page + 1} / {totalPages}
          </div>
        </>
      )}
    </div>
  );
}
