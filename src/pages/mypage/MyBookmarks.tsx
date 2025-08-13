// pages/MyBookmarks.tsx - 에러 처리 적용 버전
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UndoToast from "@src/components/commons/Toast/UndoToast";

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

// 삭제된 아이템 정보
interface DeletedItem {
  item: BookmarkItem;
  timer: NodeJS.Timeout;
  originalIndex: number;
}

// 개별 북마크 아이템 컴포넌트
interface BookmarkListItemProps {
  bookmark: BookmarkItem;
  onPostClick?: () => void;
  delay?: number;
  isSelected: boolean;
  onSelectionChange: (id: number, checked: boolean) => void;
}

const BookmarkListItem: React.FC<BookmarkListItemProps> = ({
  bookmark,
  onPostClick,
  delay = 0,
  isSelected,
  onSelectionChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelectionChange(bookmark.id, e.target.checked);
  };

  const handleRowClick = () => {
    onPostClick?.();
  };

  return (
    <div
      className={`flex items-center py-4 px-2 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      } ${isSelected ? "bg-primary/10" : ""}`}
      onClick={handleRowClick}
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
        <h3 className="text-base-content hover:text-primary transition-colors line-clamp-1">
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

  // 실행 취소 관련 상태
  const [recentlyDeleted, setRecentlyDeleted] = useState<DeletedItem[]>([]);
  const [showUndoToast, setShowUndoToast] = useState(false);

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
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 시뮬레이션: 가끔 에러 발생 (테스트용)
      if (Math.random() < 0.1) {
        // 10% 확률로 에러
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

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      recentlyDeleted.forEach((deleted) => {
        clearTimeout(deleted.timer);
      });
    };
  }, [recentlyDeleted]);

  // 뒤로가기 핸들러 (애니메이션 포함)
  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/mypage");
    }, 400);
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

  // 선택된 북마크들 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    // 기존 삭제 예정 아이템들 즉시 삭제 처리
    if (recentlyDeleted.length > 0) {
      recentlyDeleted.forEach((deleted) => {
        clearTimeout(deleted.timer);
        performActualDelete(deleted.item.id);
      });
      setRecentlyDeleted([]);
    }

    // 선택된 아이템들 정보 수집
    const itemsToDelete = bookmarks
      .map((bookmark, index) => ({ bookmark, index }))
      .filter(({ bookmark }) => selectedIds.has(bookmark.id));

    // UI에서 즉시 제거
    setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));

    // 삭제된 아이템들을 recentlyDeleted에 추가
    const deletedItems: DeletedItem[] = itemsToDelete.map(
      ({ bookmark, index }) => {
        const timer = setTimeout(() => {
          performActualDelete(bookmark.id);
          setRecentlyDeleted((prev) => {
            const remaining = prev.filter((d) => d.item.id !== bookmark.id);
            if (remaining.length === 0) {
              setShowUndoToast(false);
            }
            return remaining;
          });
        }, 5000);

        return {
          item: bookmark,
          timer,
          originalIndex: index,
        };
      }
    );

    setRecentlyDeleted(deletedItems);
    setSelectedIds(new Set());
    setShowUndoToast(true);
  };

  // 실제 삭제 처리 (서버 API 호출)
  const performActualDelete = (bookmarkId: number) => {
    console.log(`북마크 ${bookmarkId} 실제 삭제됨 (서버 API 호출)`);
  };

  // 실행 취소 핸들러
  const handleUndoDelete = () => {
    if (recentlyDeleted.length === 0) return;

    // 모든 타이머 취소
    recentlyDeleted.forEach((deleted) => {
      clearTimeout(deleted.timer);
    });

    // 모든 삭제된 아이템들을 원래 위치에 복원
    setBookmarks((prev) => {
      const newBookmarks = [...prev];
      const sortedDeleted = [...recentlyDeleted].sort(
        (a, b) => a.originalIndex - b.originalIndex
      );

      sortedDeleted.forEach((deleted) => {
        const insertIndex = Math.min(
          deleted.originalIndex,
          newBookmarks.length
        );
        newBookmarks.splice(insertIndex, 0, deleted.item);
      });

      return newBookmarks;
    });

    // 상태 초기화
    setRecentlyDeleted([]);
    setShowUndoToast(false);
  };

  // 실행 취소 토스트 닫기 핸들러
  const handleUndoToastClose = () => {
    setShowUndoToast(false);
    recentlyDeleted.forEach((deleted) => {
      clearTimeout(deleted.timer);
      performActualDelete(deleted.item.id);
    });
    setRecentlyDeleted([]);
  };

  // 토스트 메시지 생성
  const getUndoToastMessage = () => {
    const count = recentlyDeleted.length;
    if (count === 0) return "";
    if (count === 1) {
      return `"${recentlyDeleted[0].item.title.slice(
        0,
        30
      )}..." 북마크가 삭제되었습니다`;
    }
    return `${count}개의 북마크가 삭제되었습니다`;
  };

  // 전체 선택 상태 계산
  const isAllSelected =
    bookmarks.length > 0 && selectedIds.size === bookmarks.length;
  const isPartiallySelected =
    selectedIds.size > 0 && selectedIds.size < bookmarks.length;

  return (
    <>
      <div
        className={`p-4 sm:p-6 transition-all duration-500 transform ${
          isLoaded && !isExiting
            ? "opacity-100 translate-x-0"
            : isExiting
            ? "opacity-0 -translate-x-8"
            : "opacity-0 translate-x-8"
        }`}
      >
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between mb-6 transition-all duration-300 ${
            isExiting ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="flex items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-base-content">
              북마크
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            {/* 로딩이나 에러가 아닐 때만 개수 표시 */}
            {!isLoading && !error && (
              <span className="text-xs sm:text-sm text-neutral-content">
                총 {bookmarks.length}개
              </span>
            )}
            <button
              onClick={handleBackClick}
              className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-focus transition-all duration-200 group transform hover:scale-110"
              aria-label="뒤로가기"
            >
              <span className="text-primary-content text-sm sm:text-lg font-bold group-hover:rotate-180 transition-transform duration-300">
                −
              </span>
            </button>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div
          className={`bg-base-200 rounded-lg overflow-hidden transition-all duration-500 ${
            isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
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
                  className="border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  뒤로가기
                </button>
                <button
                  onClick={handleRetry}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-300"
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
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
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
                    삭제할 수 있습니다. (5초 내 실행 취소 가능)
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
                    delay={isLoaded ? index * 50 : 0}
                    isSelected={selectedIds.has(bookmark.id)}
                    onSelectionChange={handleSelectionChange}
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
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-300"
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
          <div
            className={`flex justify-center mt-8 transition-all duration-700 ${
              isLoaded && !isExiting
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button className="w-8 h-8 flex items-center justify-center text-base-content hover:bg-base-300 rounded transition-colors transform hover:scale-110">
                ‹
              </button>

              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`w-8 h-8 rounded transition-all duration-200 transform hover:scale-110 ${
                    num === 1
                      ? "bg-primary text-primary-content"
                      : "bg-base-300 text-base-content hover:bg-primary hover:text-primary-content"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button className="w-8 h-8 flex items-center justify-center text-base-content hover:bg-base-300 rounded transition-colors transform hover:scale-110">
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 실행 취소 토스트 */}
      <UndoToast
        message={getUndoToastMessage()}
        isVisible={showUndoToast}
        onUndo={handleUndoDelete}
        onClose={handleUndoToastClose}
        durationMs={5000}
      />
    </>
  );
};

export default MyBookmarks;
