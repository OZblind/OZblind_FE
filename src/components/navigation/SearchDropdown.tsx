import React from "react";
import { IoSearch } from "react-icons/io5";
import type { Category } from "../../types/search";

interface SearchDropdownProps {
  isOpen: boolean;
  searchQuery: string;
  selectedCategory: Category;
  onViewAllResults: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  searchQuery,
  selectedCategory,
  onViewAllResults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn bg-base-100 border-base-300">
      {searchQuery.trim() ? (
        <div className="p-4">
          <button
            onClick={onViewAllResults}
            className="w-full flex items-center justify-between p-3 text-left transition-all duration-150 hover:bg-primary/10 rounded-lg border border-base-300 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3">
              <IoSearch className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm font-medium text-base-content">
                  "{searchQuery}" 검색하기
                </div>
                <div className="text-xs text-base-content/60">
                  {selectedCategory}에서 검색
                </div>
              </div>
            </div>
            <div className="text-xs text-base-content/60">Enter ↵</div>
          </button>
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <IoSearch className="w-8 h-8 mx-auto mb-3 text-base-content/40" />
          <div className="text-sm font-medium mb-1 text-base-content/60">
            검색어를 입력해주세요
          </div>
          <div className="text-xs text-base-content/40">
            좌측에서 카테고리 선택 • Ctrl+K 단축키
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
