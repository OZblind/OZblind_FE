import { useEffect, useRef } from "react";
import type { Post } from "@src/types/search";

interface UseKeyboardNavigationProps {
  isOpen: boolean;
  selectedIndex: number;
  previewResults: Post[];
  totalCount: number;
  searchQuery: string;
  setSelectedIndex: (value: number | ((prev: number) => number)) => void;
  handlePostSelect: (post: Post) => void;
  handleViewAllResults: () => void;
  handleClose: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>; // null 허용으로 변경
}

export const useKeyboardNavigation = ({
  isOpen,
  selectedIndex,
  previewResults,
  totalCount,
  searchQuery,
  setSelectedIndex,
  handlePostSelect,
  handleViewAllResults,
  handleClose,
  searchInputRef,
}: UseKeyboardNavigationProps) => {
  // 키보드 네비게이션을 위한 최신 상태 ref들
  const isOpenRef = useRef(isOpen);
  const selectedIndexRef = useRef(selectedIndex);
  const previewResultsRef = useRef(previewResults);
  const totalCountRef = useRef(totalCount);
  const searchQueryRef = useRef(searchQuery);

  // ref 상태 동기화
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);
  useEffect(() => {
    previewResultsRef.current = previewResults;
  }, [previewResults]);
  useEffect(() => {
    totalCountRef.current = totalCount;
  }, [totalCount]);
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // 키보드 네비게이션 - 단일 등록으로 개선
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpenRef.current) return;

      const preview = previewResultsRef.current;
      const total = totalCountRef.current;
      const idx = selectedIndexRef.current;
      const query = searchQueryRef.current;

      const itemCount = preview.length + (total > preview.length ? 1 : 0);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (idx >= 0) {
            if (idx < preview.length) {
              handlePostSelect(preview[idx]);
            } else {
              handleViewAllResults();
            }
          } else if (preview.length > 0) {
            handlePostSelect(preview[0]);
          } else if (query.trim()) {
            handleViewAllResults();
          }
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlePostSelect, handleViewAllResults, handleClose, setSelectedIndex]);

  // 글로벌 단축키 (Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [searchInputRef]);
};
