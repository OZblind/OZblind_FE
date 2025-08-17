import { useState, useEffect, useRef } from "react";
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

// Props 타입 정의
interface InlineDropdownSearchBarProps {
  className?: string;
  placeholder?: string;
}

const categories = ["통합", "자유", "취직", "정보", "설문", "깃레포"] as const;
type Category = (typeof categories)[number];

// 카테고리 매핑
const categoryMapping: Record<Category, string> = {
  통합: "all",
  자유: "free",
  취직: "job",
  정보: "info",
  설문: "survey",
  깃레포: "github",
};

const InlineDropdownSearchBar: React.FC<InlineDropdownSearchBarProps> = ({
  className = "",
  placeholder = "검색...",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("통합");
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

  // 검색 미리보기 API 호출
  const searchPreview = async (
    query: string,
    category: Category
  ): Promise<SearchPreview> => {
    try {
      const response = await axios.get("/api/posts/search", {
        params: {
          q: query.trim(),
          category: categoryMapping[category],
          limit: 5,
          offset: 0,
        },
        headers: {
          Authorization: tokens.accessToken
            ? `Bearer ${tokens.accessToken}`
            : undefined,
        },
      });

      return {
        posts: response.data.posts || [],
        totalCount: response.data.totalCount || 0,
      };
    } catch (error) {
      console.error("Search preview API error:", error);
      return {
        posts: [],
        totalCount: 0,
      };
    }
  };

  // 검색 실행
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        try {
          const result = await searchPreview(searchQuery, selectedCategory);
          setPreviewResults(result.posts);
          setTotalCount(result.totalCount);
        } catch (error) {
          console.error("Search preview failed:", error);
          setPreviewResults([]);
          setTotalCount(0);
        } finally {
          setIsLoading(false);
        }
      } else {
        setPreviewResults([]);
        setTotalCount(0);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, tokens.accessToken]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const itemCount =
        previewResults.length + (totalCount > previewResults.length ? 1 : 0);

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
          if (selectedIndex >= 0) {
            if (selectedIndex < previewResults.length) {
              handlePostSelect(previewResults[selectedIndex]);
            } else {
              handleViewAllResults();
            }
          } else if (previewResults.length > 0) {
            handlePostSelect(previewResults[0]);
          } else if (searchQuery.trim()) {
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
  }, [
    isOpen,
    selectedIndex,
    previewResults,
    searchQuery,
    selectedCategory,
    totalCount,
  ]);

  const handleFocus = (): void => {
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handlePostSelect = (post: Post): void => {
    navigate(`/post/${post.id}`);
    handleClose();
  };

  const handleViewAllResults = (): void => {
    const params = new URLSearchParams({
      q: searchQuery,
      category: categoryMapping[selectedCategory],
    });
    navigate(`/search?${params.toString()}`);
    handleClose();
  };

  const handleClose = (): void => {
    setIsOpen(false);
    setSelectedIndex(-1);
    setIsCategoryDropdownOpen(false);
    searchRef.current?.blur();
  };

  const handleCategorySelect = (category: Category): void => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
    setSelectedIndex(-1);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      // 카테고리 드롭다운 외부 클릭
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }

      // 전체 검색 결과 외부 클릭
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
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

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
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
  };

  return (
    <div className={`relative ${className}`} ref={resultsRef}>
      {/* 검색창 + 내장 드롭다운 */}
      <div className="relative">
        <div className="flex items-center bg-neutral-800 rounded-full border border-neutral-600 hover:border-neutral-500 focus-within:border-neutral-400 transition-colors">
          <IoSearch className="ml-4 text-neutral-400 w-5 h-5" />

          {/* 카테고리 드롭다운 (검색창 내부) */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center space-x-1 px-3 py-2 text-neutral-300 hover:text-white transition-colors text-sm"
            >
              <span className="font-medium">{selectedCategory}</span>
              <IoChevronDown
                className={`w-3 h-3 transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg z-20 min-w-[100px]">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "text-neutral-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="w-px h-6 bg-neutral-600"></div>

          {/* 검색 입력창 */}
          <input
            ref={searchRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleFocus}
            className="flex-1 bg-transparent text-white placeholder-neutral-400 px-3 py-3 outline-none text-sm"
          />

          {/* 닫기 버튼 */}
          {isOpen && (
            <button
              onClick={handleClose}
              className="mr-4 text-neutral-400 hover:text-white transition-colors"
            >
              <IoClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 검색 미리보기 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* 결과 헤더 */}
          {searchQuery && (
            <div className="px-4 py-2 border-b border-neutral-700 bg-neutral-900">
              <div className="flex items-center justify-between text-xs">
                <div className="text-neutral-400">
                  <span className="text-blue-400 font-medium">
                    {selectedCategory}
                  </span>
                  에서 검색
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
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2"></div>
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
                          className={`w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors ${
                            isSelected
                              ? "bg-neutral-700 border-r-2 border-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div
                                className={`font-medium mb-1 text-sm ${
                                  isSelected ? "text-blue-400" : "text-white"
                                }`}
                              >
                                {highlightText(post.title, searchQuery)}
                              </div>
                              <div className="text-xs text-neutral-400 mb-1 line-clamp-1">
                                {highlightText(
                                  post.content.substring(0, 60) + "...",
                                  searchQuery
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-neutral-500">
                                <span>{post.author}</span>
                                <span>•</span>
                                <span>{formatDate(post.createdAt)}</span>
                                <span>•</span>
                                <span>조회 {post.viewCount}</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-3">
                              <span className="bg-neutral-700 text-neutral-300 px-2 py-1 rounded text-xs">
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
                        className={`w-full px-4 py-3 text-left border-t border-neutral-700 hover:bg-neutral-700 transition-colors ${
                          selectedIndex === previewResults.length
                            ? "bg-neutral-700 border-r-2 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-blue-400 font-medium text-sm">
                            "{searchQuery}" 전체 결과 보기
                          </div>
                          <div className="text-neutral-400 text-xs">
                            {totalCount}개 →
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <div className="text-sm text-neutral-400 mb-1">
                      "{searchQuery}"에 대한 검색 결과가 없습니다
                    </div>
                    <div className="text-xs text-neutral-500">
                      다른 키워드나 카테고리를 시도해보세요
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-6 text-center">
                <IoSearch className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                <div className="text-sm text-neutral-400">
                  검색어를 입력해주세요
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  좌측에서 카테고리 선택 • Ctrl+K 단축키
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
