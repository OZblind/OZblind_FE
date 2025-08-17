import React from "react";
import { IoSearch } from "react-icons/io5";
import type { Post, Category } from "@src/types/search";
import SearchResultItem from "./SearchResultltem";

interface SearchDropdownProps {
  isOpen: boolean;
  searchQuery: string;
  selectedCategory: Category;
  selectedIndex: number;
  previewResults: Post[];
  totalCount: number;
  isLoading: boolean;
  mode: "default" | "detail";
  onPostSelect: (post: Post) => void;
  onViewAllResults: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  searchQuery,
  selectedCategory,
  selectedIndex,
  previewResults,
  totalCount,
  isLoading,
  mode,
  onPostSelect,
  onViewAllResults,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn"
      role="listbox"
      aria-label="검색 결과"
    >
      {/* 결과 헤더 */}
      {searchQuery && (
        <div className="px-4 py-3 border-b border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800">
          <div className="flex items-center justify-between text-xs">
            <div className="text-neutral-400 flex items-center space-x-1">
              <span className="text-blue-400 font-medium bg-blue-400/10 px-2 py-1 rounded">
                {selectedCategory}
              </span>
              <span>에서 검색</span>
            </div>
            {totalCount > 0 && (
              <div className="text-neutral-400">
                <span className="font-medium text-white">{totalCount}개</span>{" "}
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
        {isLoading ? (
          <div className="px-4 py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
            <div className="text-sm text-neutral-400">검색 중...</div>
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
                  />
                ))}

                {/* 전체 결과 보기 버튼 */}
                {totalCount > previewResults.length && (
                  <button
                    onClick={onViewAllResults}
                    className={`w-full px-4 py-3 text-left border-t border-neutral-700 transition-all duration-150 hover:bg-neutral-700 border-l-2 ${
                      selectedIndex === previewResults.length
                        ? "bg-neutral-700 border-l-blue-500"
                        : "border-l-transparent hover:border-l-neutral-600"
                    }`}
                    role="option"
                    aria-selected={selectedIndex === previewResults.length}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-blue-400 font-medium text-sm">
                        "{searchQuery}" 전체 결과 보기
                      </div>
                      <div className="text-xs text-neutral-400 flex items-center">
                        <span className="mr-1">{totalCount}개</span>
                        <span>→</span>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <IoSearch className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
                <div className="text-sm text-neutral-400 mb-1 font-medium">
                  "{searchQuery}"에 대한 검색 결과가 없습니다
                </div>
                <div className="text-xs text-neutral-500">
                  다른 키워드나 카테고리를 시도해보세요
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="px-4 py-8 text-center">
            <IoSearch className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
            <div className="text-sm text-neutral-400 font-medium mb-1">
              검색어를 입력해주세요
            </div>
            <div className="text-xs text-neutral-500">
              좌측에서 카테고리 선택 •{" "}
              <kbd className="bg-neutral-700 px-1 py-0.5 rounded text-xs">
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
