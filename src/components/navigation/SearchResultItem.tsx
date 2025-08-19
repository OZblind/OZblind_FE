import React from "react";
import type { Post } from "@src/types/search";
import { formatRelativeDate, highlightText } from "@src/utils/searchUtils";

interface SearchResultItemProps {
  post: Post;
  searchQuery: string;
  isSelected: boolean;
  onClick: () => void;
  isDark?: boolean;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  post,
  searchQuery,
  isSelected,
  onClick,
  isDark = true, // 기본값 설정
}) => {
  // 테마별 스타일 정의
  const themeStyles = {
    container: {
      base: isDark ? "hover:bg-neutral-700" : "hover:bg-gray-50",
      selected: isDark
        ? "bg-neutral-700 border-l-blue-500"
        : "bg-blue-50 border-l-blue-500",
      border: isDark ? "hover:border-l-neutral-600" : "hover:border-l-gray-300",
    },
    text: {
      title: isSelected
        ? "text-blue-400" // 선택된 상태는 공통으로 blue
        : isDark
        ? "text-white"
        : "text-gray-900",
      content: isDark ? "text-neutral-400" : "text-gray-600",
      meta: isDark ? "text-neutral-500" : "text-gray-500",
    },
    badge: isDark
      ? "bg-neutral-700 text-neutral-300"
      : "bg-gray-100 text-gray-700",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 text-left transition-all duration-150 border-l-2 ${
        isSelected
          ? `${themeStyles.container.selected} shadow-md`
          : `border-l-transparent ${themeStyles.container.base} ${themeStyles.container.border}`
      }`}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div
            className={`font-medium mb-1 text-sm transition-colors duration-150 ${themeStyles.text.title}`}
          >
            {highlightText(post.title, searchQuery)}
          </div>
          <div
            className={`text-xs mb-2 line-clamp-1 ${themeStyles.text.content}`}
          >
            {highlightText(post.content.substring(0, 60) + "...", searchQuery)}
          </div>
          <div
            className={`flex items-center space-x-2 text-xs ${themeStyles.text.meta}`}
          >
            <span className="font-medium">{post.author}</span>
            <span>•</span>
            <span>{formatRelativeDate(post.createdAt)}</span>
            <span>•</span>
            <span>조회 {post.viewCount}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${themeStyles.badge}`}
          >
            {post.category}
          </span>
        </div>
      </div>
    </button>
  );
};

export default SearchResultItem;
