import React from "react";
import type { Post } from "@src/types/search";
import { formatRelativeDate, highlightText } from "@src/utils/searchUtils";

interface SearchResultItemProps {
  post: Post;
  searchQuery: string;
  isSelected: boolean;
  onClick: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  post,
  searchQuery,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 text-left transition-all duration-150 hover:bg-neutral-700 border-l-2 ${
        isSelected
          ? "bg-neutral-700 border-l-blue-500 shadow-md"
          : "border-l-transparent hover:border-l-neutral-600"
      }`}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div
            className={`font-medium mb-1 text-sm transition-colors duration-150 ${
              isSelected ? "text-blue-400" : "text-white"
            }`}
          >
            {highlightText(post.title, searchQuery)}
          </div>
          <div className="text-xs text-neutral-400 mb-2 line-clamp-1">
            {highlightText(post.content.substring(0, 60) + "...", searchQuery)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <span className="font-medium">{post.author}</span>
            <span>•</span>
            <span>{formatRelativeDate(post.createdAt)}</span>
            <span>•</span>
            <span>조회 {post.viewCount}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-3">
          <span className="bg-neutral-700 text-neutral-300 px-2 py-1 rounded-full text-xs font-medium">
            {post.category}
          </span>
        </div>
      </div>
    </button>
  );
};

export default SearchResultItem;
