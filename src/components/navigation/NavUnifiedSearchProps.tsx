import React, { useRef, useEffect, useState } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import type { NavUnifiedSearchProps, Category } from "@src/types/search";
import { useSearchLogic } from "@src/hooks/useSearchLogic";
import { useKeyboardNavigation } from "@src/hooks/useKeyboardNavigation";
import { useThemeIcon } from "@src/hooks/useThemeIcon";
import CategoryDropdown from "./CategoryDropdown";
import SearchDropdown from "./SearchDropdown";

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

  // 팀의 테마 훅 사용 (자동 테마 감지)
  useThemeIcon();

  // 검색 로직 훅
  const {
    isOpen,
    searchQuery,
    selectedCategory,
    setIsOpen,
    setSearchQuery,
    handleClose,
    handleViewAllResults,
    handleFocus,
    handleCategorySelect,
  } = useSearchLogic({ maxPreviewResults });

  // 키보드 네비게이션 훅 (Enter 키 처리용)
  useKeyboardNavigation({
    isOpen,
    selectedIndex: -1,
    previewResults: [],
    totalCount: 0,
    searchQuery,
    setSelectedIndex: () => {},
    handlePostSelect: () => {},
    handleViewAllResults,
    handleClose,
    searchInputRef: searchRef,
  });

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

  const handleCloseWithDropdown = () => {
    handleClose();
    setIsCategoryDropdownOpen(false);
    searchRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setIsCategoryDropdownOpen(false);
      }

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
      <div className="relative">
        <div
          className={`flex items-center rounded-full border transition-all duration-200 bg-base-100 border-base-300 ${
            isOpen || isCategoryDropdownOpen
              ? "border-primary shadow-lg"
              : "hover:border-base-content/30"
          }`}
        >
          <CategoryDropdown
            selectedCategory={selectedCategory}
            isOpen={isCategoryDropdownOpen}
            onToggle={handleCategoryToggle}
            onSelect={handleCategorySelectWithDropdownClose}
            dropdownRef={categoryDropdownRef}
          />

          <div className="w-px h-6 bg-base-300 mx-2"></div>

          <input
            ref={searchRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleFocus}
            className="flex-1 bg-transparent text-base-content placeholder-base-content/50 px-2 py-3 outline-none text-sm"
            aria-label="검색어 입력"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            autoComplete="off"
          />

          {isOpen ? (
            <button
              onClick={handleCloseWithDropdown}
              className="mr-4 text-base-content/60 hover:text-base-content transition-colors p-1 rounded-full hover:bg-base-content/10"
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
              className="mr-4 text-base-content/60 hover:text-base-content transition-colors p-1 rounded-full hover:bg-base-content/10"
              aria-label="검색 실행"
            >
              <IoSearch className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <SearchDropdown
        isOpen={isOpen}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onViewAllResults={handleViewAllResults}
      />
    </div>
  );
};

export default InlineDropdownSearchBar;
