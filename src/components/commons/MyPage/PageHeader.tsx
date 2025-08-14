// components/common/MyPage/PageHeader.tsx
import React from "react";

interface PageHeaderProps {
  title: string;
  count?: number;
  onBackClick: () => void;
  isExiting?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  count,
  onBackClick,
  isExiting = false,
  isLoading = false,
  hasError = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between mb-6 transition-all duration-300 ${
        isExiting ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="flex items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-base-content">
          {title}
        </h2>
      </div>
      <div className="flex items-center space-x-3">
        {/* 로딩이나 에러가 아닐 때만 개수 표시 */}
        {!isLoading && !hasError && count !== undefined && (
          <span className="text-xs sm:text-sm text-neutral-content">
            총 {count}개
          </span>
        )}
        <button
          onClick={onBackClick}
          className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-focus transition-all duration-200 group transform hover:scale-110"
          aria-label="뒤로가기"
        >
          <span className="text-primary-content text-sm sm:text-lg font-bold group-hover:rotate-180 transition-transform duration-300">
            −
          </span>
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
