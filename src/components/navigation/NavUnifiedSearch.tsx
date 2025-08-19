import React, { useRef, useEffect, useState } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import type { NavUnifiedSearchProps, Category } from "../../types/search";
import { useSearchLogic } from "../../hooks/useSearchLogic";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { useThemeIcon } from "../../hooks/useThemeIcon"; // 팀의 테마 훅 사용
import CategoryDropdown from "./CategoryDropdown";
import SearchDropdown from "./SearchDropdown";

interface ThemedNavUnifiedSearchProps extends NavUnifiedSearchProps {
  isDark?: boolean;
}

const NavUnifiedSearch: React.FC<ThemedNavUnifiedSearchProps> = ({
  className = "",
  placeholder = "검색...",
  mode = "default",
  maxPreviewResults = mode === "detail" ? 8 : 5,
  isDark, // 상위에서 전달받거나 팀 테마 시스템에서 자동 감지
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] =
    useState<boolean>(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // 팀의 테마 훅 사용
  const teamTheme = useThemeIcon();

  // isDark가 전달되지 않으면 팀 테마 시스템 사용
  const currentTheme = isDark !== undefined ? isDark : teamTheme === "oz_dark";

  // 검색 로직 훅
  const {
    isOpen,
    searchQuery,
    selectedCategory,
    selectedIndex,
    previewResults,
    isLoading,
    totalCount,
    error,
    setIsOpen,
    setSearchQuery,
    setSelectedIndex,
    handleClose,
    handlePostSelect,
    handleViewAllResults,
    handleFocus,
    handleCategorySelect,
    handleRetry,
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

  // 테마별 스타일 정의
  const themeStyles = {
    container: currentTheme
      ? "!bg-neutral-800 !border-neutral-600 hover:!border-neutral-500"
      : "!bg-white !border-gray-300 hover:!border-gray-400",
    focusedContainer: currentTheme
      ? "!border-neutral-400 !shadow-lg"
      : "!border-blue-400 !shadow-lg",
    input: currentTheme
      ? "!text-white placeholder:!text-neutral-400"
      : "!text-gray-900 placeholder:!text-gray-500",
    button: currentTheme
      ? "!text-neutral-400 hover:!text-white hover:!bg-neutral-700"
      : "!text-gray-500 hover:!text-gray-700 hover:!bg-gray-100",
    divider: currentTheme ? "!bg-neutral-600" : "!bg-gray-300",
  };

  return (
    <div className={`relative ${className}`} ref={resultsRef}>
      <div className="relative">
        <div
          className={`flex items-center rounded-full border transition-all duration-200 ${
            themeStyles.container
          } ${
            isOpen || isCategoryDropdownOpen ? themeStyles.focusedContainer : ""
          }`}
          style={{
            backgroundColor: currentTheme
              ? "#262626 !important"
              : "#ffffff !important",
            borderColor: currentTheme
              ? "#525252 !important"
              : "#d1d5db !important",
          }}
        >
          <CategoryDropdown
            selectedCategory={selectedCategory}
            isOpen={isCategoryDropdownOpen}
            onToggle={handleCategoryToggle}
            onSelect={handleCategorySelectWithDropdownClose}
            dropdownRef={categoryDropdownRef}
            isDark={currentTheme}
          />

          <div className={`w-px h-6 mx-2 ${themeStyles.divider}`}></div>

          <input
            ref={searchRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleFocus}
            className={`flex-1 bg-transparent px-2 py-3 outline-none text-sm ${themeStyles.input}`}
            style={{
              color: currentTheme ? "#ffffff !important" : "#111827 !important",
            }}
            aria-label="검색어 입력"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            autoComplete="off"
          />

          {isOpen ? (
            <button
              onClick={handleCloseWithDropdown}
              className={`mr-4 transition-colors p-1 rounded-full ${themeStyles.button}`}
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
              className={`mr-4 transition-colors p-1 rounded-full ${themeStyles.button}`}
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
        selectedIndex={selectedIndex}
        previewResults={previewResults}
        totalCount={totalCount}
        isLoading={isLoading}
        error={error}
        mode={mode}
        onPostSelect={handlePostSelect}
        onViewAllResults={handleViewAllResults}
        onRetry={handleRetry}
        isDark={currentTheme}
      />
    </div>
  );
};

export default NavUnifiedSearch;
