import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@src/components/commons/MyPage/PageHeader";
import Pagination from "@src/components/commons/MyPage/Pagination";
import {
  ANIMATION_TIMINGS,
  ANIMATION_CLASSES,
  getDurationClass,
} from "@constants/animations";

// 게시글 데이터 타입
interface PostItem {
  id: number;
  category: string;
  title: string;
  date: string;
  views?: number;
  comments?: number;
}

interface PostListItemProps {
  post: PostItem;
  onClick?: () => void;
  index?: number; // delay 대신 index 사용 (CSS로 처리)
  isExiting?: boolean; // 네비게이션 가드용 추가
}

const PostListItem: React.FC<PostListItemProps> = ({
  post,
  onClick,
  index = 0,
  isExiting = false,
}) => {
  return (
    <div
      className={`flex items-center py-4 px-2 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform opacity-0 translate-x-8 animate-slide-in`}
      style={{
        // CSS로 순차 등장 효과 구현 (JavaScript 타이머 불필요)
        transitionDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
        animationDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
      }}
      onClick={() => !isExiting && onClick?.()} // 네비게이션 중복 방지
    >
      {/* 카테고리 */}
      <div className="w-16 flex-shrink-0">
        <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded">
          {post.category}
        </span>
      </div>

      {/* 제목 */}
      <div className="flex-1 px-4">
        <h3
          className={`text-base-content hover:text-primary transition-colors ${getDurationClass(
            ANIMATION_TIMINGS.HOVER_TRANSITION
          )} line-clamp-1`}
        >
          {post.title}
        </h3>
      </div>

      {/* 날짜 */}
      <div className="w-20 sm:w-24 text-right text-xs sm:text-sm text-neutral-content">
        {post.date}
      </div>
    </div>
  );
};

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 간단한 상태 관리
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 게시글 데이터 로딩 함수
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_TIMINGS.LOADING_DELAY_POSTS)
      );

      if (Math.random() < 0.1) {
        throw new Error("서버에서 데이터를 가져오는데 실패했습니다.");
      }

      const dummyPosts: PostItem[] = [
        {
          id: 1,
          category: "자유",
          title: "안녕하세요 처음 가입했어요 ㅎㅎ ㅎㅎㅎ [21]",
          date: "2024.01.15",
          views: 124,
          comments: 21,
        },
        {
          id: 2,
          category: "질문",
          title: "동료들과의 관계에 대해서~",
          date: "2024.01.14",
          views: 67,
          comments: 5,
        },
        {
          id: 3,
          category: "자유",
          title: "점심 뭐 먹을까 고민입니다",
          date: "2024.01.13",
          views: 89,
          comments: 12,
        },
        {
          id: 4,
          category: "익명",
          title: "회사 생활 처음인데 조언 구해요",
          date: "2024.01.12",
          views: 156,
          comments: 8,
        },
        {
          id: 5,
          category: "자유",
          title: "오늘 날씨 정말 좋네요 [4]",
          date: "2024.01.11",
          views: 43,
          comments: 4,
        },
        {
          id: 6,
          category: "질문",
          title: "신입이 물어보기 어려운 질문들 [3]",
          date: "2024.01.10",
          views: 234,
          comments: 15,
        },
      ];

      setPosts(dummyPosts);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/mypage");
    }, ANIMATION_TIMINGS.PAGE_TRANSITION);
  };

  const handlePostClick = (postId: number) => {
    console.log(`게시글 ${postId} 클릭`);
    // navigate(`/post/${postId}`);
  };

  const handleRetry = () => {
    loadPosts();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log(`페이지 ${page}로 이동`);
  };

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
          title="작성글"
          count={posts.length}
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
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-primary loading-lg"></span>
              <p className="text-neutral-content text-sm mt-4">
                게시글을 불러오는 중...
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
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

          {/* 정상 상태 - 게시글 목록 */}
          {!isLoading && !error && (
            <>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onClick={() => handlePostClick(post.id)}
                    index={index} // delay 대신 index 전달
                    isExiting={isExiting} // 네비게이션 가드 전달
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-neutral-content text-4xl mb-4">📝</div>
                  <h3 className="text-neutral-content text-lg font-medium mb-2">
                    작성한 글이 없습니다
                  </h3>
                  <p className="text-neutral-content text-sm mb-6">
                    첫 번째 글을 작성해보세요!
                  </p>
                  <button
                    onClick={() => navigate("/write")}
                    className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                      ANIMATION_TIMINGS.HOVER_TRANSITION
                    )}`}
                  >
                    글쓰기
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {!isLoading && !error && posts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoaded={isLoaded}
            isExiting={isExiting}
          />
        )}
      </div>

      {/* CSS 애니메이션 - 전역 스타일에 추가하거나 styled-components 사용 */}
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
    </>
  );
};

export default MyPosts;
