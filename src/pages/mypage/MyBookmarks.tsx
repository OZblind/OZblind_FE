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
import type { BookmarkItem } from "@src/types/mypage";
import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import {
  useMyBookmarks,
  useDeleteBookmarks,
  useMyPagePagination,
  useMyPageLoadingState,
  useMyPageError,
} from "@src/hooks/useMyPageData";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  EMPTY_MESSAGES,
  BUTTON_TEXT,
  LIST_SETTINGS,
} from "@src/constants/ui";
import { PATHS } from "@constants/paths";

const formatDate = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface BookmarkListItemProps {
  bookmark: BookmarkItem;
  onPostClick?: () => void;
  index?: number;
  isSelected: boolean;
  onSelectionChange: (id: number, checked: boolean) => void;
  isExiting?: boolean;
  getBookmarkIconPath: () => string;
}

function BookmarkListItem({
  bookmark,
  onPostClick,
  index = 0,
  isSelected,
  onSelectionChange,
  isExiting = false,
  getBookmarkIconPath,
}: BookmarkListItemProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelectionChange(bookmark.id, e.target.checked);
  };

  const handleRowClick = () => {
    if (!isExiting) onPostClick?.();
  };

  const createdDate = formatDate(bookmark.date);
  const bookmarkedAt = formatDate(bookmark.bookmarkedDate);

  return (
    <div
      className={`
        grid grid-cols-[24px,auto,1fr,auto,24px] gap-3 items-center
        py-3 px-3 sm:py-4 sm:px-4
        hover:bg-base-100 rounded-md
        cursor-pointer transition-all duration-500 transform
        opacity-0 translate-x-8 animate-slide-in
        ${isSelected ? "bg-primary/10" : ""}
      `}
      style={{
        transitionDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
        animationDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
      }}
      onClick={handleRowClick}
    >
      {/* 체크박스 */}
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="checkbox checkbox-primary checkbox-sm border border-base-content bg-transparent
                     [&:checked]:bg-primary [&:checked]:border-primary [&:checked:after]:text-white"
          onClick={(e) => e.stopPropagation()}
          aria-label="북마크 선택"
        />
      </div>

      {/* 카테고리 */}
      <div className="min-w-[42px]">
        <span className="bg-base-300 text-base-content/90 text-[11px] px-2 py-0.5 rounded">
          {bookmark.category}
        </span>
      </div>

      {/* 제목 & 부가정보 */}
      <div className="min-w-0">
        <h3
          className={`text-base-content hover:text-primary transition-colors ${getDurationClass(
            ANIMATION_TIMINGS.HOVER_TRANSITION
          )} truncate`}
          title={bookmark.title}
        >
          {bookmark.title}
        </h3>

        {/* 북마크일시: 값 있을 때만 */}
        {bookmarkedAt && (
          <p className="text-[12px] text-neutral-content mt-0.5">
            북마크: {bookmarkedAt}
          </p>
        )}
      </div>

      {/* 원글 작성일 */}
      <div className="text-right text-xs sm:text-sm text-neutral-content tabular-nums">
        {createdDate}
      </div>

      {/* 아이콘 */}
      <div className="w-6 h-6 flex items-center justify-center">
        <img
          src={getBookmarkIconPath()}
          alt="북마크"
          className="w-4 h-4 opacity-80 select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}

function MyBookmarks(): React.ReactElement {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 선택 관리
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 테마 훅
  const themeIcon = useThemeIcon();

  // 테마별 아이콘
  const bookmarkIcon = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return dark ? icons.mypageBookmark?.light : icons.mypageBookmark?.dark;
  }, [themeIcon]);

  const getBookmarkIconPath = () => bookmarkIcon || "";

  // 1. 북마크 데이터 fetching
  const {
    data: bookmarksData,
    isLoading: bookmarksLoading,
    error: bookmarksErrorMessage,
    refetch: refetchBookmarks,
  } = useMyBookmarks(currentPage, LIST_SETTINGS.ITEMS_PER_PAGE);

  // 2. 북마크 삭제 뮤테이션
  const { mutate: deleteBookmarksMutate, isPending: isDeleting } =
    useDeleteBookmarks();

  // 3. 통합 로딩 상태 관리
  const { isAnyLoading } = useMyPageLoadingState();

  // 4. 페이지네이션 정보 관리
  const { totalPages, onPageChange: handlePageChange } = useMyPagePagination(
    bookmarksData,
    currentPage,
    setCurrentPage
  );

  // 5. 에러 메시지 처리
  const { hasError, errorMessage, retry } = useMyPageError(
    bookmarksErrorMessage,
    refetchBookmarks
  );

  const bookmarks = bookmarksData?.data || [];
  const allBookmarksCount = bookmarksData?.pagination?.totalItems || 0;

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleBackClick = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsExiting(true);
    timeoutRef.current = setTimeout(() => {
      navigate("/mypage");
      timeoutRef.current = null;
    }, ANIMATION_TIMINGS.PAGE_TRANSITION);
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handlePostClick = (postId: number) => {
    if (!postId) return;
    navigate(PATHS.POST_DETAIL.replace(":id", String(postId)));
  };

  const onPageChangeWithSelectionReset = (page: number) => {
    handlePageChange(page);
    setSelectedIds(new Set());
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

    deleteBookmarksMutate(Array.from(selectedIds), {
      onSuccess: () => {
        useToastStore.getState().push({
          message:
            count === 1
              ? "북마크가 삭제되었습니다."
              : `${count}개의 북마크가 삭제되었습니다.`,
          type: "success",
          durationMs: 3000,
        });
        setSelectedIds(new Set());
        refetchBookmarks();
      },
      onError: (err: Error) => {
        useToastStore.getState().push({
          message: `북마크 삭제에 실패했습니다: ${err.message}`,
          type: "error",
          durationMs: 3000,
        });
      },
    });
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
          count={allBookmarksCount}
          onBackClick={handleBackClick}
          isExiting={isExiting}
          isLoading={bookmarksLoading || isAnyLoading || isDeleting}
          hasError={hasError}
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
          {/* 로딩 상태 */}
          {(bookmarksLoading || isAnyLoading || isDeleting) && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-primary loading-lg"></span>
              <p className="text-neutral-content text-sm mt-4">
                {LOADING_MESSAGES.BOOKMARKS}
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {hasError && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                <img
                  src={getBookmarkIconPath()}
                  alt="북마크"
                  className="w-16 h-16 mx-auto"
                />
              </div>
              <h3 className="text-lg font-medium text-base-content mb-2">
                {ERROR_MESSAGES.GENERAL}
              </h3>
              <p className="text-neutral-content text-sm mb-6 max-w-md mx-auto">
                {errorMessage}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBackClick}
                  className={`border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                    ANIMATION_TIMINGS.HOVER_TRANSITION
                  )}`}
                >
                  {BUTTON_TEXT.BACK}
                </button>
                <button
                  onClick={() => retry?.()}
                  className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                    ANIMATION_TIMINGS.HOVER_TRANSITION
                  )}`}
                >
                  {BUTTON_TEXT.RETRY}
                </button>
              </div>
            </div>
          )}

          {/* 정상 상태 - 북마크 목록 */}
          {!bookmarksLoading && !hasError && bookmarksData && (
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
                      <span className="text-sm">{BUTTON_TEXT.SELECT_ALL}</span>
                    </label>
                    {selectedIds.size > 0 && (
                      <span className="text-xs text-primary">
                        {selectedIds.size}개 선택됨
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0 || isDeleting}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${getDurationClass(
                      ANIMATION_TIMINGS.HOVER_TRANSITION
                    )} ${
                      selectedIds.size > 0 && !isDeleting
                        ? "bg-error/50 text-white hover:bg-error/80"
                        : "bg-base-300 text-neutral-content cursor-not-allowed"
                    }`}
                  >
                    {BUTTON_TEXT.DELETE_SELECTED} ({selectedIds.size})
                    {isDeleting && (
                      <span className="loading loading-spinner loading-xs ml-1"></span>
                    )}
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

              {bookmarks.length > 0 ? (
                <div className="space-y-3">
                  {bookmarks.map((bookmark, index) => (
                    <div
                      key={bookmark.id}
                      className="bg-base-200 rounded-lg border border-base-300/20 hover:bg-base-100 transition-colors"
                    >
                      <BookmarkListItem
                        bookmark={bookmark}
                        onPostClick={() => handlePostClick(bookmark.postId)}
                        index={index}
                        isSelected={selectedIds.has(bookmark.id)}
                        onSelectionChange={handleSelectionChange}
                        isExiting={isExiting}
                        getBookmarkIconPath={getBookmarkIconPath}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-neutral-content text-4xl mb-4">
                    <img
                      src={getBookmarkIconPath()}
                      alt="북마크"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
                  <h3 className="text-neutral-content text-lg font-medium mb-2">
                    {EMPTY_MESSAGES.BOOKMARKS}
                  </h3>
                  <p className="text-neutral-content text-sm mb-6">
                    마음에 드는 글을 북마크해보세요!
                  </p>
                  <button
                    onClick={() => navigate(PATHS.FREE_BOARD)}
                    className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                      ANIMATION_TIMINGS.HOVER_TRANSITION
                    )}`}
                  >
                    {BUTTON_TEXT.VIEW_BOARD}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {!bookmarksLoading &&
          !hasError &&
          bookmarksData &&
          allBookmarksCount > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChangeWithSelectionReset}
              isLoaded={isLoaded}
              isExiting={isExiting}
            />
          )}
      </div>

      <SlideInStyles />
    </>
  );
}

export default MyBookmarks;
