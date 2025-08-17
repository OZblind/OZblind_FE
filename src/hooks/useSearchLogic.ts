import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "@store/authStore";
import { searchPreviewApi } from "@src/api/searchApi";
import type { Post, Category } from "@src/types/search";
import { categoryMapping } from "@src/types/search";

interface UseSearchLogicProps {
  maxPreviewResults: number;
}

export const useSearchLogic = ({ maxPreviewResults }: UseSearchLogicProps) => {
  // 상태 관리
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [previewResults, setPreviewResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  const navigate = useNavigate();
  const { tokens } = useAuthStore();

  // 요청 취소와 중복 요청 방지를 위한 ref들
  const controllerRef = useRef<AbortController | null>(null);
  const latestReqIdRef = useRef(0);

  // 검색 미리보기 실행
  const executeSearch = useCallback(
    async (query: string, category: Category) => {
      if (!query.trim()) {
        controllerRef.current?.abort();
        setPreviewResults([]);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      // 이전 요청 취소
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      // 최신 요청 ID 추적
      const reqId = ++latestReqIdRef.current;

      setIsLoading(true);
      try {
        const result = await searchPreviewApi(
          query,
          category,
          maxPreviewResults,
          tokens.accessToken || undefined, // null을 undefined로 변환
          controller.signal
        );

        // 컴포넌트가 언마운트되거나 더 최신 요청이 있는 경우 상태 업데이트 방지
        if (reqId === latestReqIdRef.current && !controller.signal.aborted) {
          setPreviewResults(result.posts);
          setTotalCount(result.totalCount);
        }
      } catch (error) {
        // AbortError는 정상적인 취소이므로 처리하지 않음
        if (!axios.isCancel(error) && (error as Error).name !== "AbortError") {
          console.error("Search preview failed:", error);
          if (reqId === latestReqIdRef.current) {
            setPreviewResults([]);
            setTotalCount(0);
          }
        }
      } finally {
        if (reqId === latestReqIdRef.current && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [maxPreviewResults, tokens.accessToken]
  );

  // 디바운스된 검색 실행
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      executeSearch(searchQuery, selectedCategory);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, executeSearch]);

  // 컴포넌트 언마운트 시 요청 취소
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // 핸들러 함수들
  const handleClose = useCallback((): void => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  const handlePostSelect = useCallback(
    (post: Post): void => {
      navigate(`/post/${post.id}`);
      handleClose();
    },
    [navigate, handleClose]
  );

  const handleViewAllResults = useCallback((): void => {
    const params = new URLSearchParams({
      q: searchQuery,
      category: categoryMapping[selectedCategory],
    });
    navigate(`/search?${params.toString()}`);
    handleClose();
  }, [navigate, searchQuery, selectedCategory, handleClose]);

  const handleFocus = useCallback((): void => {
    setIsOpen(true);
    setSelectedIndex(-1);
  }, []);

  const handleCategorySelect = useCallback((category: Category): void => {
    setSelectedCategory(category);
    setSelectedIndex(-1);
  }, []);

  return {
    // 상태
    isOpen,
    searchQuery,
    selectedCategory,
    selectedIndex,
    previewResults,
    isLoading,
    totalCount,

    // 상태 변경 함수
    setIsOpen,
    setSearchQuery,
    setSelectedIndex,

    // 핸들러
    handleClose,
    handlePostSelect,
    handleViewAllResults,
    handleFocus,
    handleCategorySelect,
  };
};
