import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearch, IoClose, IoChevronDown } from "react-icons/io5";
import axios from "axios";
import { useAuthStore } from "@store/authStore";

// 게시글 타입 정의
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  createdAt: string;
  viewCount: number;
}

// 검색 미리보기 결과 타입
interface SearchPreview {
  posts: Post[];
  totalCount: number;
}

// Props 타입 정의 - default와 detail 모드 지원
interface InlineDropdownSearchBarProps {
  className?: string;
  placeholder?: string;
  mode?: "default" | "detail";
  maxPreviewResults?: number;
}

const categories = ["전체", "자유", "취업", "정보", "설문", "Github"] as const;
type Category = (typeof categories)[number];

// 카테고리 매핑 - 백엔드 호환성을 위해 소문자로 통일
const categoryMapping: Record<Category, string> = {
  전체: "all",
  자유: "free",
  취업: "job",
  정보: "info",
  설문: "survey",
  Github: "github", // 백엔드와 대소문자 확인 필요
};

// 정규식 메타문자 이스케이프 유틸리티
const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const InlineDropdownSearchBar: React.FC<InlineDropdownSearchBarProps> = ({
  className = "",
  placeholder = "검색...",
  mode = "default",
  maxPreviewResults = mode === "detail" ? 8 : 5,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [previewResults, setPreviewResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] =
    useState<boolean>(false);

  const navigate = useNavigate();
  const { tokens } = useAuthStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // 요청 취소와 중복 요청 방지를 위한 ref들
  const controllerRef = useRef<AbortController | null>(null);
  const latestReqIdRef = useRef(0);

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

  // 검색 미리보기 API 호출
  const searchPreview = useCallback(
    async (
      query: string,
      category: Category,
      signal?: AbortSignal
    ): Promise<SearchPreview> => {
      try {
        const response = await axios.get("/api/posts/search", {
          params: {
            q: query.trim(),
            category: categoryMapping[category],
            limit: maxPreviewResults,
            offset: 0,
          },
          headers: {
            Authorization: tokens.accessToken
              ? `Bearer ${tokens.accessToken}`
              : undefined,
          },
          signal, // AbortSignal 추가
        });

        return {
          posts: response.data.posts || [],
          totalCount: response.data.totalCount || 0,
        };
      } catch (error) {
        // AbortError는 정상적인 취소이므로 로그하지 않음
        if (axios.isCancel(error) || (error as Error).name === "AbortError") {
          throw error;
        }
        console.error("Search preview API error:", error);
        return {
          posts: [],
          totalCount: 0,
        };
      }
    },
    [maxPreviewResults, tokens.accessToken]
  );

  // 핸들러 함수들을 useCallback으로 메모이제이션
  const handleClose = useCallback((): void => {
    setIsOpen(false);
    setSelectedIndex(-1);
    setIsCategoryDropdownOpen(false);
    searchRef.current?.blur();
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
    setIsCategoryDropdownOpen(false);
    setSelectedIndex(-1);
    setTimeout(() => {
      searchRef.current?.focus();
      setIsOpen(true);
    }, 100);
  }, []);

  // 검색 실행 - 요청 취소 및 중복 방지 로직 추가
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        // 이전 요청 취소
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        // 최신 요청 ID 추적
        const reqId = ++latestReqIdRef.current;

        setIsLoading(true);
        try {
          const result = await searchPreview(
            searchQuery,
            selectedCategory,
            controller.signal
          );

          // 컴포넌트가 언마운트되거나 더 최신 요청이 있는 경우 상태 업데이트 방지
          if (reqId === latestReqIdRef.current && !controller.signal.aborted) {
            setPreviewResults(result.posts);
            setTotalCount(result.totalCount);
          }
        } catch (error) {
          // AbortError는 정상적인 취소이므로 처리하지 않음
          if (
            !axios.isCancel(error) &&
            (error as Error).name !== "AbortError"
          ) {
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
      } else {
        // 빈 검색어인 경우 이전 요청 취소하고 결과 초기화
        controllerRef.current?.abort();
        setPreviewResults([]);
        setTotalCount(0);
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery, selectedCategory, searchPreview]);

  // 컴포넌트 언마운트 시 요청 취소
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

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
  }, [handlePostSelect, handleViewAllResults, handleClose]); // 빈 배열 대신 필요한 핸들러만 의존성 추가

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
  }, []);

  // 글로벌 단축키
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}분 전`;
    } else if (hours < 24) {
      return `${hours}시간 전`;
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // 텍스트 하이라이트 - 정규식 메타문자 이스케이프 적용
  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    try {
      const escapedQuery = escapeRegExp(query);
      const regex = new RegExp(`(${escapedQuery})`, "gi");
      const parts = text.split(regex);

      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-400 text-black px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch (error) {
      // 정규식 생성 실패 시 원본 텍스트 반환
      console.warn("Regex creation failed for query:", query, error);
      return text;
    }
  };

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
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => {
                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm min-w-[80px] justify-center rounded-full ml-1 transition-all duration-200 ${
                isCategoryDropdownOpen
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-neutral-300 hover:text-white hover:bg-blue-500"
              }`}
              aria-expanded={isCategoryDropdownOpen}
              aria-haspopup="listbox"
              aria-label={`카테고리 선택: ${selectedCategory}`}
            >
              <span className="font-medium">{selectedCategory}</span>
              <IoChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 카테고리 드롭다운 메뉴 */}
            {isCategoryDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-600 rounded-xl shadow-xl z-[70] w-full min-w-[100px] overflow-hidden animate-fadeIn"
                role="listbox"
                aria-label="카테고리 목록"
              >
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-neutral-600"></div>
                {categories
                  .filter((category) => category !== selectedCategory)
                  .map((category, index, filteredArray) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full px-3 py-2.5 text-center text-sm transition-all duration-150 hover:bg-neutral-700 text-neutral-300 ${
                        index === 0 ? "rounded-t-xl" : ""
                      } ${
                        index === filteredArray.length - 1 ? "rounded-b-xl" : ""
                      }`}
                      role="option"
                      aria-selected={false}
                    >
                      {category}
                    </button>
                  ))}
              </div>
            )}
          </div>

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
              onClick={handleClose}
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
      {isOpen && (
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
                    <span className="font-medium text-white">
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
            {isLoading ? (
              <div className="px-4 py-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                <div className="text-sm text-neutral-400">검색 중...</div>
              </div>
            ) : searchQuery.trim() ? (
              <>
                {previewResults.length > 0 ? (
                  <div className="py-2">
                    {previewResults.map((post, index) => {
                      const isSelected = index === selectedIndex;

                      return (
                        <button
                          key={post.id}
                          onClick={() => handlePostSelect(post)}
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
                                {highlightText(
                                  post.content.substring(0, 60) + "...",
                                  searchQuery
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-neutral-500">
                                <span className="font-medium">
                                  {post.author}
                                </span>
                                <span>•</span>
                                <span>{formatDate(post.createdAt)}</span>
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
                    })}

                    {/* 전체 결과 보기 버튼 */}
                    {totalCount > previewResults.length && (
                      <button
                        onClick={handleViewAllResults}
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
      )}
    </div>
  );
};

export default InlineDropdownSearchBar;
