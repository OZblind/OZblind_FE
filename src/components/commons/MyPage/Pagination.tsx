import React from "react";
import { ANIMATION_TIMINGS, getDurationClass } from "@constants/animations";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoaded?: boolean;
  isExiting?: boolean;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 5,
  onPageChange,
  isLoaded = true,
  isExiting = false,
  maxVisiblePages = 5,
}) => {
  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  // 표시할 페이지 번호 계산
  const getVisiblePages = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div
      className={`flex justify-center mt-8 transition-all duration-700 ${
        isLoaded && !isExiting
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* 이전 버튼 */}
        <button
          onClick={handlePrevClick}
          disabled={currentPage <= 1}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors transform hover:scale-110 ${getDurationClass(
            ANIMATION_TIMINGS.HOVER_TRANSITION
          )} ${
            currentPage <= 1
              ? "text-neutral-content cursor-not-allowed"
              : "text-base-content hover:bg-base-300"
          }`}
          aria-label="이전 페이지"
        >
          ‹
        </button>

        {/* 페이지 번호들 */}
        {visiblePages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageClick(pageNum)}
            className={`w-8 h-8 rounded transition-all transform hover:scale-110 ${getDurationClass(
              ANIMATION_TIMINGS.HOVER_TRANSITION
            )} ${
              pageNum === currentPage
                ? "bg-primary text-primary-content"
                : "bg-base-300 text-base-content hover:bg-primary hover:text-primary-content"
            }`}
            aria-label={`${pageNum}페이지로 이동`}
            aria-current={pageNum === currentPage ? "page" : undefined}
          >
            {pageNum}
          </button>
        ))}

        {/* 다음 버튼 */}
        <button
          onClick={handleNextClick}
          disabled={currentPage >= totalPages}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors transform hover:scale-110 ${getDurationClass(
            ANIMATION_TIMINGS.HOVER_TRANSITION
          )} ${
            currentPage >= totalPages
              ? "text-neutral-content cursor-not-allowed"
              : "text-base-content hover:bg-base-300"
          }`}
          aria-label="다음 페이지"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
