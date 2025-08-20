import React from "react";
import { IoSearch, IoRefresh, IoWarning } from "react-icons/io5";
import type { Post, Category } from "../../types/search";
import SearchResultItem from "./SearchResultItem";

interface SearchDropdownProps {
  isOpen: boolean;
  searchQuery: string;
  selectedCategory: Category;
  selectedIndex: number;
  previewResults: Post[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  mode: "default" | "detail";
  onPostSelect: (post: Post) => void;
  onViewAllResults: () => void;
  onRetry?: () => void;
  isDark?: boolean;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  searchQuery,
  selectedCategory,
  selectedIndex,
  previewResults,
  totalCount,
  isLoading,
  error,
  mode,
  onPostSelect,
  onViewAllResults,
  onRetry,
  isDark = true,
}) => {
  if (!isOpen) return null;

  // 테마별 스타일 정의
  const themeStyles = {
    container: isDark
      ? "bg-neutral-800 border-neutral-600"
      : "bg-white border-gray-200",
    header: isDark
      ? "border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800"
      : "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100",
    text: {
      primary: isDark ? "text-white" : "text-gray-900",
      secondary: isDark ? "text-neutral-400" : "text-gray-600",
      muted: isDark ? "text-neutral-500" : "text-gray-500",
    },
    button: {
      primary: isDark
        ? "bg-blue-600 hover:bg-blue-500 text-white"
        : "bg-blue-600 hover:bg-blue-500 text-white",
      viewAll: isDark
        ? "hover:bg-neutral-700 border-neutral-700 hover:border-neutral-600"
        : "hover:bg-gray-50 border-gray-200 hover:border-gray-300",
      viewAllSelected: isDark
        ? "bg-neutral-700 border-l-blue-500"
        : "bg-gray-50 border-l-blue-500",
    },
    spinner: isDark ? "border-blue-500" : "border-blue-600",
    kbd: isDark ? "bg-neutral-700" : "bg-gray-200 text-gray-700",
  };

  return (
    <div
      className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn ${themeStyles.container}`}
      role="listbox"
      aria-label="검색 결과"
    >
      {/* 결과 헤더 */}
      {searchQuery && !error && (
        <div className={`px-4 py-3 border-b ${themeStyles.header}`}>
          <div className="flex items-center justify-between text-xs">
            <div
              className={`flex items-center space-x-1 ${themeStyles.text.secondary}`}
            >
              <span className="text-blue-400 font-medium bg-blue-400/10 px-2 py-1 rounded">
                {selectedCategory}
              </span>
              <span>에서 검색</span>
            </div>
            {totalCount > 0 && (
              <div className={themeStyles.text.secondary}>
                <span className={`font-medium ${themeStyles.text.primary}`}>
                  {totalCount}개
                </span>{" "}
                결과
              </div>
            )}
          </div>
        </div>
      )}

      {/* 검색 미리보기 결과 */}
      <div
        className={`overflow-y-auto ${
          mode === "detail" ? "max-h-96" : "max-h-80"
        }`}
      >
        {/* 에러 상태 */}
        {error ? (
          <div className="px-4 py-8 text-center">
            <IoWarning className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <div className="text-sm text-red-400 mb-3 font-medium">
              오류가 발생했습니다
            </div>
            <div className={`text-xs mb-4 ${themeStyles.text.secondary}`}>
              {error}
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className={`flex items-center space-x-2 mx-auto px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${themeStyles.button.primary}`}
              >
                <IoRefresh className="w-4 h-4" />
                <span>다시 시도</span>
              </button>
            )}
          </div>
        ) : isLoading ? (
          <div className="px-4 py-6 text-center">
            <div
              className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mx-auto mb-3 ${themeStyles.spinner}`}
            ></div>
            <div className={`text-sm ${themeStyles.text.secondary}`}>
              검색 중...
            </div>
          </div>
        ) : searchQuery.trim() ? (
          <>
            {previewResults.length > 0 ? (
              <div className="py-2">
                {previewResults.map((post, index) => (
                  <SearchResultItem
                    key={post.id}
                    post={post}
                    searchQuery={searchQuery}
                    isSelected={index === selectedIndex}
                    onClick={() => onPostSelect(post)}
                    isDark={isDark}
                  />
                ))}

                {/* 전체 결과 보기 버튼 */}
                {totalCount > previewResults.length && (
                  <button
                    onClick={onViewAllResults}
                    className={`w-full px-4 py-3 text-left border-t transition-all duration-150 border-l-2 ${
                      selectedIndex === previewResults.length
                        ? themeStyles.button.viewAllSelected
                        : `border-l-transparent ${themeStyles.button.viewAll}`
                    }`}
                    role="option"
                    aria-selected={selectedIndex === previewResults.length}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-blue-400 font-medium text-sm">
                        "{searchQuery}" 전체 결과 보기
                      </div>
                      <div
                        className={`text-xs flex items-center ${themeStyles.text.secondary}`}
                      >
                        <span className="mr-1">{totalCount}개</span>
                        <span>→</span>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <IoSearch
                  className={`w-8 h-8 mx-auto mb-3 ${themeStyles.text.muted}`}
                />
                <div
                  className={`text-sm mb-1 font-medium ${themeStyles.text.secondary}`}
                >
                  "{searchQuery}"에 대한 검색 결과가 없습니다
                </div>
                <div className={`text-xs ${themeStyles.text.muted}`}>
                  다른 키워드나 카테고리를 시도해보세요
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="px-4 py-8 text-center">
            <IoSearch
              className={`w-8 h-8 mx-auto mb-3 ${themeStyles.text.muted}`}
            />
            <div
              className={`text-sm font-medium mb-1 ${themeStyles.text.secondary}`}
            >
              검색어를 입력해주세요
            </div>
            <div className={`text-xs ${themeStyles.text.muted}`}>
              좌측에서 카테고리 선택 •{" "}
              <kbd className={`px-1 py-0.5 rounded text-xs ${themeStyles.kbd}`}>
                Ctrl+K
              </kbd>{" "}
              단축키
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;
