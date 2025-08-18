// components/navigation/InlineDropdownSearchBar.tsx
import React, { useRef, useEffect, useState } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import type { NavUnifiedSearchProps, Category } from "@src/types/search";
import { useSearchLogic } from "@src/hooks/useSearchLogic";
import { useKeyboardNavigation } from "@src/hooks/useKeyboardNavigation";
import CategoryDropdown from "./CategoryDropdown";
import SearchDropdown from "./SearchDropdown";
import { error } from "console";

const InlineDropdownSearchBar: React.FC<NavUnifiedSearchProps> = ({
  className = "",
  placeholder = "검색...",
  mode = "default",
  maxPreviewResults = mode === "detail" ? 8 : 5,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] =
    useState<boolean>(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // 검색 로직 훅
  const {
    isOpen,
    searchQuery,
    selectedCategory,
    selectedIndex,
    previewResults,
    isLoading,
    totalCount,
    setIsOpen,
    setSearchQuery,
    setSelectedIndex,
    handleClose,
    handlePostSelect,
    handleViewAllResults,
    handleFocus,
    handleCategorySelect,
  } = useSearchLogic({ maxPreviewResults });

  // 키보드 네비게이션 훅
  useKeyboardNavigation({
    isOpen,
    selectedIndex,
    previewResults,
    totalCount,
    searchQuery,
    setSelectedIndex,
    handlePostSelect,
    handleViewAllResults,
    handleClose,
    searchInputRef: searchRef,
  });

  // 카테고리 드롭다운 핸들러
  const handleCategoryToggle = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleCategorySelectWithDropdownClose = (category: Category) => {
    handleCategorySelect(category);
    setIsCategoryDropdownOpen(false);
    setTimeout(() => {
      searchRef.current?.focus();
      setIsOpen(true);
    }, 100);
  };

  // 검색창 닫기 핸들러 확장
  const handleCloseWithDropdown = () => {
    handleClose();
    setIsCategoryDropdownOpen(false);
    searchRef.current?.blur();
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;

      // 카테고리 드롭다운 외부 클릭
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setIsCategoryDropdownOpen(false);
      }

      // 전체 검색 결과 외부 클릭
      if (resultsRef.current && !resultsRef.current.contains(target)) {
        setIsOpen(false);
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className={`relative ${className}`} ref={resultsRef}>
      {/* 검색창 + 드롭다운 */}
      <div className="relative">
        <div
          className={`flex items-center bg-neutral-800 rounded-full border transition-all duration-200 ${
            isOpen || isCategoryDropdownOpen
              ? "border-neutral-400 shadow-lg"
              : "border-neutral-600 hover:border-neutral-500"
          }`}
        >
          {/* 카테고리 드롭다운 (왼쪽) */}
          <CategoryDropdown
            selectedCategory={selectedCategory}
            isOpen={isCategoryDropdownOpen}
            onToggle={handleCategoryToggle}
            onSelect={handleCategorySelectWithDropdownClose}
            dropdownRef={categoryDropdownRef}
          />

          {/* 구분선 */}
          <div className="w-px h-6 bg-neutral-600 mx-2"></div>

          {/* 검색 입력창 (중앙) */}
          <input
            ref={searchRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleFocus}
            className="flex-1 bg-transparent text-white placeholder-neutral-400 px-2 py-3 outline-none text-sm"
            aria-label="검색어 입력"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            autoComplete="off"
          />

          {/* 검색 버튼 또는 닫기 버튼 (오른쪽) */}
          {isOpen ? (
            <button
              onClick={handleCloseWithDropdown}
              className="mr-4 text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700"
              aria-label="검색창 닫기"
            >
              <IoClose className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  handleViewAllResults();
                } else {
                  searchRef.current?.focus();
                }
              }}
              className="mr-4 text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700"
              aria-label="검색 실행"
            >
              <IoSearch className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 검색 미리보기 드롭다운 */}
      <SearchDropdown
        isOpen={isOpen}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedIndex={selectedIndex}
        previewResults={previewResults}
        totalCount={totalCount}
        isLoading={isLoading}
        error={typeof error === "string" ? error : null}
        mode={mode}
        onPostSelect={handlePostSelect}
        onViewAllResults={handleViewAllResults}
      />
    </div>
  );
};

export default InlineDropdownSearchBar;
