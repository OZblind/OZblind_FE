import React from "react";

interface PageHeaderProps {
  title: string;
  count?: number;
  onBack: () => void;
  isExiting?: boolean;
  className?: string;
  children?: React.ReactNode; // 추가 버튼이나 요소들
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  count,
  onBack,
  isExiting = false,
  className = "",
  children,
}) => {
  return (
    <div
      className={`flex items-center justify-between mb-6 transition-all duration-300 ${
        isExiting ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
      } ${className}`}
    >
      {/* 왼쪽: 제목 */}
      <div className="flex items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-base-content">
          {title}
        </h2>
      </div>

      {/* 오른쪽: 개수 + 추가 요소 + 뒤로가기 버튼 */}
      <div className="flex items-center space-x-3">
        {/* 개수 표시 */}
        {typeof count === "number" && (
          <span className="text-xs sm:text-sm text-neutral-content">
            총 {count}개
          </span>
        )}

        {/* 추가 요소들 (검색 버튼 등) */}
        {children}

        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
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
