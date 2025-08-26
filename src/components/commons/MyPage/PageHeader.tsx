import React from "react";
import {
  ANIMATION_TIMINGS,
  ANIMATION_CLASSES,
  getDurationClass,
} from "@constants/animations";

interface PageHeaderProps {
  title: string;
  count?: number;
  onBackClick?: () => void;
  isExiting?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  count,
  onBackClick,
  isExiting = false,
  isLoading = false,
  hasError = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between mb-6 transition-all ${getDurationClass(
        ANIMATION_TIMINGS.SCALE_TRANSITION
      )} ${
        isExiting
          ? ANIMATION_CLASSES.HEADER_EXIT
          : ANIMATION_CLASSES.HEADER_ENTER
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
        {/* 뒤로가기 버튼 - minus 아이콘으로 변경 */}
        {onBackClick && (
          <button
            onClick={() => onBackClick?.()}
            className={`w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-focus transition-all ${getDurationClass(
              ANIMATION_TIMINGS.HOVER_TRANSITION
            )} group transform hover:scale-110`}
            aria-label="뒤로가기"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className={`text-white group-hover:rotate-180 transition-transform ${getDurationClass(
                ANIMATION_TIMINGS.SCALE_TRANSITION
              )}`}
            >
              <path
                d="M3 8H13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
