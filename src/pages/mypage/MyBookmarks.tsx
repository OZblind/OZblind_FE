import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "@src/store/toastStore";
import { PageHeader } from "@src/components/commons/MyPage/PageHeader";
import Pagination from "@src/components/commons/MyPage/Pagination";
import {
  ANIMATION_TIMINGS,
  ANIMATION_CLASSES,
  getDurationClass,
} from "@constants/animations";

// 북마크 데이터 타입
interface BookmarkItem {
  id: number;
  postId: number;
  category: string;
  title: string;
  date: string;
  bookmarkedDate: string;
  views?: number;
  comments?: number;
}

interface BookmarkListItemProps {
  bookmark: BookmarkItem;
  onPostClick?: () => void;
  index?: number; // delay 대신 index 사용 (CSS로 처리)
  isSelected: boolean;
  onSelectionChange: (id: number, checked: boolean) => void;
  isExiting?: boolean; // 네비게이션 가드용 추가
}

const BookmarkListItem: React.FC<BookmarkListItemProps> = ({
  bookmark,
  onPostClick,
  index = 0,
  isSelected,
  onSelectionChange,
  isExiting = false,
}) => {
  // ❌ 기존: useState + useEffect + setTimeout 제거
  // const [isVisible, setIsVisible] = useState(false);
  // useEffect(() => {
  //   const timer = setTimeout(() => setIsVisible(true), delay);
  //   return () => clearTimeout(timer);
  // }, [delay]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelectionChange(bookmark.id, e.target.checked);
  };

  const handleRowClick = () => {
    if (!isExiting) {
      // 네비게이션 가드
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
      onClick={handleRowClick} // 네비게이션 가드 적용됨
    >
      {/* 체크박스 */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="checkbox checkbox-primary checkbox-sm border-white bg-transparent"
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
        <span className="text-warning text-lg">🔖</span>
      </div>
    </div>
  );
};

const MyBookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 간단한 상태 관리
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 선택 관리
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4; // 임시로 4페이지로 설정

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 북마크 데이터 로딩 함수
  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 시뮬레이션: 네트워크 지연
      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_TIMINGS.LOADING_DELAY_BOOKMARKS)
      );

      // 시뮬레이션: 가끔 에러 발생 (테스트용)
      if (Math.random() < 0.1) {
        throw new Error("북마크 데이터를 불러오는데 실패했습니다.");
      }

      // 임시 북마크 데이터
      const dummyBookmarks: BookmarkItem[] = [
        {
          id: 1,
          postId: 1,
          category: "자유",
          title: "안녕하세요 처음 가입했어요 ㅎㅎ ㅎㅎㅎ [21]",
          date: "2024.01.15",
          bookmarkedDate: "2024.01.16",
          views: 124,
          comments: 21,
        },
        {
          id: 2,
          postId: 4,
          category: "익명",
          title: "회사 생활 처음인데 조언 구해요",
          date: "2024.01.12",
          bookmarkedDate: "2024.01.14",
          views: 156,
          comments: 8,
        },
        {
          id: 3,
          postId: 6,
          category: "질문",
          title: "신입이 물어보기 어려운 질문들 [3]",
          date: "2024.01.10",
          bookmarkedDate: "2024.01.13",
          views: 234,
          comments: 15,
        },
        {
          id: 4,
          postId: 8,
          category: "자유",
          title: "점심시간 맛집 추천 받아요!",
          date: "2024.01.09",
          bookmarkedDate: "2024.01.12",
          views: 89,
          comments: 12,
        },
        {
          id: 5,
          postId: 12,
          category: "질문",
          title: "이직 준비 어떻게 하셨나요?",
          date: "2024.01.08",
          bookmarkedDate: "2024.01.11",
          views: 178,
          comments: 23,
        },
      ];

      setBookmarks(dummyBookmarks);
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

  // 뒤로가기 핸들러 (애니메이션 포함)
  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/mypage");
    }, ANIMATION_TIMINGS.PAGE_TRANSITION);
  };

  // 게시글 클릭 핸들러
  const handlePostClick = (postId: number) => {
    console.log(`게시글 ${postId}로 이동`);
    // navigate(`/post/${postId}`);
  };

  // 재시도 핸들러
  const handleRetry = () => {
    loadBookmarks();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log(`북마크 페이지 ${page}로 이동`);
  };

  // 체크박스 선택 핸들러
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

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(bookmarks.map((b) => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 선택된 북마크들 삭제 핸들러 - 간단한 확인 후 즉시 삭제
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    // 확인 대화상자
    const count = selectedIds.size;
    const message =
      count === 1
        ? "선택한 북마크를 삭제하시겠습니까?"
        : `선택한 ${count}개의 북마크를 삭제하시겠습니까?`;

    if (!confirm(message)) return;

    // 선택된 북마크들의 제목 수집 (토스트 메시지용)
    const selectedBookmarks = bookmarks.filter((b) => selectedIds.has(b.id));
    const deleteMessage =
      count === 1
        ? `"${selectedBookmarks[0].title.slice(
            0,
            30
          )}..." 북마크가 삭제되었습니다`
        : `${count}개의 북마크가 삭제되었습니다`;

    // UI에서 즉시 제거
    setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));

    // 서버 API 호출 (실제 삭제)
    performActualDelete(Array.from(selectedIds));

    // 삭제 완료 토스트 표시
    useToastStore.getState().push({
      message: deleteMessage,
      type: "success",
      durationMs: 3000,
    });

    setSelectedIds(new Set());
  };

  // 실제 삭제 처리 (서버 API 호출)
  const performActualDelete = (bookmarkIds: number[]) => {
    console.log(`북마크 ${bookmarkIds.join(", ")} 삭제됨 (서버 API 호출)`);
    // 실제로는 여기서 서버 API 호출
    // api.deleteBookmarks(bookmarkIds);
  };

  // 전체 선택 상태 계산
  const isAllSelected =
    bookmarks.length > 0 && selectedIds.size === bookmarks.length;
  const isPartiallySelected =
    selectedIds.size > 0 && selectedIds.size < bookmarks.length;

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
        {/* PageHeader 컴포넌트 */}
        <PageHeader
          title="북마크"
          count={bookmarks.length}
          onBackClick={handleBackClick}
          isExiting={isExiting}
          isLoading={isLoading}
          hasError={!!error}
        />

        {/* 메인 컨텐츠 */}
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
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-primary loading-lg"></span>
              <p className="text-neutral-content text-sm mt-4">
                북마크를 불러오는 중...
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔖</div>
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

          {/* 정상 상태 - 북마크 목록 */}
          {!isLoading && !error && (
            <>
              {/* 선택 및 삭제 컨트롤 */}
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
                        className="checkbox checkbox-primary checkbox-sm border-white bg-transparent"
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
                        ? "bg-error text-error-content hover:bg-error/80 transform hover:scale-105"
                        : "bg-base-300 text-neutral-content cursor-not-allowed"
                    }`}
                  >
                    선택 삭제 ({selectedIds.size})
                  </button>
                </div>
              )}

              {/* 안내 메시지 */}
              {bookmarks.length > 0 && (
                <div className="p-3 bg-info/10 border-b border-base-300">
                  <p className="text-sm text-info">
                    💡 체크박스로 북마크를 선택하고 "선택 삭제" 버튼으로 일괄
                    삭제할 수 있습니다.
                  </p>
                </div>
              )}

              {/* 북마크 리스트 또는 빈 상태 */}
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark, index) => (
                  <BookmarkListItem
                    key={bookmark.id}
                    bookmark={bookmark}
                    onPostClick={() => handlePostClick(bookmark.postId)}
                    index={index} // delay 대신 index 전달
                    isSelected={selectedIds.has(bookmark.id)}
                    onSelectionChange={handleSelectionChange}
                    isExiting={isExiting} // 네비게이션 가드 전달
                  />
                ))
              ) : (
                // 빈 상태
                <div className="text-center py-12">
                  <div className="text-neutral-content text-4xl mb-4">🔖</div>
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

        {/* 페이지네이션 - 데이터가 있을 때만 표시 */}
        {!isLoading && !error && bookmarks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoaded={isLoaded}
            isExiting={isExiting}
          />
        )}
      </div>

      {/* CSS 애니메이션 - MyPosts와 동일 */}
      <style>{`
        @keyframes slide-in {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>

      {/* 기존 UndoToast 완전 제거됨 */}
    </>
  );
};

export default MyBookmarks;
