import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

// 개별 북마크 아이템 컴포넌트
interface BookmarkListItemProps {
  bookmark: BookmarkItem;
  onPostClick?: () => void;
  onBookmarkRemove?: () => void;
  delay?: number;
}

const BookmarkListItem: React.FC<BookmarkListItemProps> = ({
  bookmark,
  onPostClick,
  onBookmarkRemove,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    setIsRemoving(true);

    // 애니메이션 후 제거
    setTimeout(() => {
      onBookmarkRemove?.();
    }, 300);
  };

  return (
    <div
      className={`flex items-center py-4 px-2 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform ${
        isVisible && !isRemoving
          ? "opacity-100 translate-x-0"
          : isRemoving
          ? "opacity-0 -translate-x-8 scale-95"
          : "opacity-0 translate-x-8"
      }`}
      onClick={onPostClick}
    >
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

      {/* 북마크 제거 버튼 */}
      <button
        onClick={handleBookmarkClick}
        className="w-8 h-8 bg-error/10 hover:bg-error/20 rounded-full flex items-center justify-center transition-colors duration-200 group"
        aria-label="북마크 제거"
      >
        <span className="text-error text-lg group-hover:scale-110 transition-transform duration-200">
          🔖
        </span>
      </button>
    </div>
  );
};

const MyBookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
    // 임시 북마크 데이터 설정
    setBookmarks([
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
    ]);
  }, []);

  // 뒤로가기 핸들러 (애니메이션 포함)
  const handleBackClick = () => {
    // 1. 사라지는 애니메이션 시작
    setIsExiting(true);

    // 2. 애니메이션 완료 후 페이지 이동
    setTimeout(() => {
      navigate("/mypage");
    }, 400);
  };

  // 게시글 클릭 핸들러
  const handlePostClick = (postId: number) => {
    console.log(`게시글 ${postId}로 이동`);
    // 추후 상세 페이지로 이동
    // navigate(`/post/${postId}`);
  };

  // 북마크 제거 핸들러
  const handleBookmarkRemove = (bookmarkId: number) => {
    setBookmarks((prev) =>
      prev.filter((bookmark) => bookmark.id !== bookmarkId)
    );
    console.log(`북마크 ${bookmarkId} 제거됨`);
  };

  return (
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
          <span className="text-xs sm:text-sm text-neutral-content">
            총 {bookmarks.length}개
          </span>
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

      {/* 안내 메시지 */}
      <div
        className={`mb-4 p-3 bg-info/10 rounded-lg transition-all duration-500 ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <p className="text-sm text-info">
          💡 북마크를 클릭하면 원글로 이동하고, 🔖 버튼을 클릭하면 북마크에서
          제거됩니다.
        </p>
      </div>

      {/* 북마크 목록 */}
      <div
        className={`bg-base-200 rounded-lg overflow-hidden transition-all duration-500 ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {bookmarks.length > 0 ? (
          bookmarks.map((bookmark, index) => (
            <BookmarkListItem
              key={bookmark.id}
              bookmark={bookmark}
              onPostClick={() => handlePostClick(bookmark.postId)}
              onBookmarkRemove={() => handleBookmarkRemove(bookmark.id)}
              delay={isLoaded ? index * 50 : 0} // 순차적으로 나타나는 효과
            />
          ))
        ) : (
          // 빈 상태
          <div className="text-center py-12">
            <div className="text-neutral-content text-4xl mb-4">🔖</div>
            <p className="text-neutral-content text-sm">
              북마크한 글이 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {bookmarks.length > 0 && (
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
  );
};

export default MyBookmarks;
