import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "@src/store/toastStore";
import { PageHeader } from "@src/components/commons/MyPage/PageHeader";
import Pagination from "@src/components/commons/MyPage/Pagination";
import {
  ANIMATION_TIMINGS,
  ANIMATION_CLASSES,
  getDurationClass,
  SlideInStyles,
} from "@constants/animations";
import { mockBookmarks } from "@src/mocks/mypage.mock";
import type { BookmarkItem } from "@src/types/mypage";
import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";

// 페이지네이션 설정
const ITEMS_PER_PAGE = 5;

interface BookmarkListItemProps {
  bookmark: BookmarkItem;
  onPostClick?: () => void;
  index?: number;
  isSelected: boolean;
  onSelectionChange: (id: number, checked: boolean) => void;
  isExiting?: boolean;
  getBookmarkIconPath: () => string;
}

const BookmarkListItem: React.FC<BookmarkListItemProps> = ({
  bookmark,
  onPostClick,
  index = 0,
  isSelected,
  onSelectionChange,
  isExiting = false,
  getBookmarkIconPath,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelectionChange(bookmark.id, e.target.checked);
  };

  const handleRowClick = () => {
    if (!isExiting) {
      onPostClick?.();
    }
  };

  return (
    <div
      className={`flex items-center py-4 px-2 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform opacity-0 translate-x-8 animate-slide-in ${
        isSelected ? "bg-primary/10" : ""
      }`}
      style={{
        transitionDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
        animationDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
      }}
      onClick={handleRowClick}
    >
      {/* 체크박스 */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="checkbox checkbox-primary checkbox-sm border border-base-content bg-transparent [&:checked]:bg-primary [&:checked]:border-primary [&:checked:after]:text-white"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* 카테고리 */}
      <div className="w-16 flex-shrink-0">
        <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded">
          {bookmark.category}
        </span>
      </div>

      {/* 제목 */}
      <div className="flex-1 px-4">
        <h3
          className={`text-base-content hover:text-primary transition-colors ${getDurationClass(
            ANIMATION_TIMINGS.HOVER_TRANSITION
          )} line-clamp-1`}
        >
          {bookmark.title}
        </h3>
        <p className="text-xs text-neutral-content mt-1">
          북마크: {bookmark.bookmarkedDate}
        </p>
      </div>

      {/* 원글 날짜 */}
      <div className="w-20 sm:w-24 text-right text-xs sm:text-sm text-neutral-content mr-3">
        {bookmark.date}
      </div>

      {/* 북마크 아이콘 */}
      <div className="w-8 h-8 flex items-center justify-center">
        <img src={getBookmarkIconPath()} alt="북마크" className="w-5 h-5" />
      </div>
    </div>
  );
};

const MyBookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 상태 관리
  const [allBookmarks, setAllBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 선택 관리
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allBookmarks.length / ITEMS_PER_PAGE);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 팀 훅 사용
  const themeIcon = useThemeIcon();

  // 테마에 따른 북마크 아이콘을 useMemo로 메모이제이션
  const bookmarkIcon = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return dark ? icons.mypageBookmark?.light : icons.mypageBookmark?.dark;
  }, [themeIcon]);

  const getBookmarkIconPath = () => bookmarkIcon;

  // 페이지네이션 계산 함수
  const updatePageData = useCallback(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = allBookmarks.slice(startIndex, endIndex);
    setBookmarks(pageData);
  }, [currentPage, allBookmarks]);

  // 페이지 변경 시 데이터 업데이트
  useEffect(() => {
    updatePageData();
  }, [updatePageData]);

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 북마크 데이터 로딩 함수
  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_TIMINGS.LOADING_DELAY_BOOKMARKS)
      );

      if (Math.random() < 0.1) {
        throw new Error("북마크 데이터를 불러오는데 실패했습니다.");
      }

      setAllBookmarks(mockBookmarks);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      setIsLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleBackClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsExiting(true);
    timeoutRef.current = setTimeout(() => {
      navigate("/mypage");
      timeoutRef.current = null;
    }, ANIMATION_TIMINGS.PAGE_TRANSITION);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handlePostClick = (postId: number) => {
    console.log(`게시글 ${postId}로 이동`);
  };

  const handleRetry = () => {
    loadBookmarks();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds(new Set());
    console.log(`북마크 페이지 ${page}로 이동`);
  };

  const handleSelectionChange = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = bookmarks.map((b) => b.id);
      setSelectedIds(new Set(currentPageIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    const message =
      count === 1
        ? "선택한 북마크를 삭제하시겠습니까?"
        : `선택한 ${count}개의 북마크를 삭제하시겠습니까?`;

    if (!window.confirm(message)) return;

    const selectedBookmarks = allBookmarks.filter((b) => selectedIds.has(b.id));
    const deleteMessage =
      count === 1
        ? `"${selectedBookmarks[0].title.slice(
            0,
            30
          )}..." 북마크가 삭제되었습니다`
        : `${count}개의 북마크가 삭제되었습니다`;

    setAllBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    performActualDelete(Array.from(selectedIds));

    useToastStore.getState().push({
      message: deleteMessage,
      type: "success",
      durationMs: 3000,
    });

    setSelectedIds(new Set());
  };

  const performActualDelete = (bookmarkIds: number[]) => {
    console.log(`북마크 ${bookmarkIds.join(", ")} 삭제됨`);
  };

  const isAllSelected =
    bookmarks.length > 0 &&
    bookmarks.every((bookmark) => selectedIds.has(bookmark.id));
  const isPartiallySelected = selectedIds.size > 0 && !isAllSelected;

  return (
    <>
      <div
        className={`p-4 sm:p-6 transition-all ${getDurationClass(
          ANIMATION_TIMINGS.ITEM_APPEAR
        )} transform ${
          isLoaded && !isExiting
            ? ANIMATION_CLASSES.PAGE_ENTER
            : isExiting
            ? ANIMATION_CLASSES.PAGE_EXIT
            : ANIMATION_CLASSES.PAGE_INITIAL
        }`}
      >
        <PageHeader
          title="북마크"
          count={allBookmarks.length}
          onBackClick={handleBackClick}
          isExiting={isExiting}
          isLoading={isLoading}
          hasError={!!error}
        />

        <div
          className={`bg-base-200 rounded-lg overflow-hidden transition-all ${getDurationClass(
            ANIMATION_TIMINGS.ITEM_APPEAR
          )} ${
            isExiting
              ? ANIMATION_CLASSES.CONTAINER_EXIT
              : ANIMATION_CLASSES.CONTAINER_ENTER
          }`}
        >
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-primary loading-lg"></span>
              <p className="text-neutral-content text-sm mt-4">
                북마크를 불러오는 중...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                <img
                  src={getBookmarkIconPath()}
                  alt="북마크"
                  className="w-16 h-16 mx-auto"
                />
              </div>
              <h3 className="text-lg font-medium text-base-content mb-2">
                문제가 발생했습니다
              </h3>
              <p className="text-neutral-content text-sm mb-6 max-w-md mx-auto">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBackClick}
                  className={`border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                    ANIMATION_TIMINGS.HOVER_TRANSITION
                  )}`}
                >
                  뒤로가기
                </button>
                <button
                  onClick={handleRetry}
                  className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                    ANIMATION_TIMINGS.HOVER_TRANSITION
                  )}`}
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {bookmarks.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-base-300/30 border-b border-base-300">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isPartiallySelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="checkbox checkbox-primary checkbox-sm border border-base-content bg-transparent [&:checked]:bg-primary [&:checked]:border-primary [&:checked:after]:text-white"
                      />
                      <span className="text-sm">전체 선택</span>
                    </label>
                    {selectedIds.size > 0 && (
                      <span className="text-xs text-primary">
                        {selectedIds.size}개 선택됨
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${getDurationClass(
                      ANIMATION_TIMINGS.HOVER_TRANSITION
                    )} ${
                      selectedIds.size > 0
                        ? "bg-error/50 text-white hover:bg-error/80"
                        : "bg-base-300 text-neutral-content cursor-not-allowed"
                    }`}
                  >
                    선택 삭제 ({selectedIds.size})
                  </button>
                </div>
              )}

              {bookmarks.length > 0 && (
                <div className="p-3 bg-info/10 border-b border-base-300">
                  <p className="text-sm text-info">
                    체크박스로 북마크를 선택하고 "선택 삭제" 버튼으로 일괄
                    삭제할 수 있습니다.
                  </p>
                </div>
              )}

              {bookmarks.length > 0
                ? bookmarks.map((bookmark, index) => (
                    <BookmarkListItem
                      key={bookmark.id}
                      bookmark={bookmark}
                      onPostClick={() => handlePostClick(bookmark.postId)}
                      index={index}
                      isSelected={selectedIds.has(bookmark.id)}
                      onSelectionChange={handleSelectionChange}
                      isExiting={isExiting}
                      getBookmarkIconPath={getBookmarkIconPath}
                    />
                  ))
                : !isLoading &&
                  !error &&
                  allBookmarks.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-neutral-content text-4xl mb-4">
                        <img
                          src={getBookmarkIconPath()}
                          alt="북마크"
                          className="w-12 h-12 mx-auto"
                        />
                      </div>
                      <h3 className="text-neutral-content text-lg font-medium mb-2">
                        북마크한 글이 없습니다
                      </h3>
                      <p className="text-neutral-content text-sm mb-6">
                        마음에 드는 글을 북마크해보세요!
                      </p>
                      <button
                        onClick={() => navigate("/board")}
                        className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                          ANIMATION_TIMINGS.HOVER_TRANSITION
                        )}`}
                      >
                        게시판 보기
                      </button>
                    </div>
                  )}
            </>
          )}
        </div>

        {!isLoading && !error && allBookmarks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoaded={isLoaded}
            isExiting={isExiting}
          />
        )}
      </div>

      <SlideInStyles />
    </>
  );
};

export default MyBookmarks;
