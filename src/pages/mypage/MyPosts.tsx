import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@src/components/commons/MyPage/PageHeader";
import Pagination from "@src/components/commons/MyPage/Pagination";
import {
  ANIMATION_TIMINGS,
  ANIMATION_CLASSES,
  getDurationClass,
  SlideInStyles,
} from "@constants/animations";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  EMPTY_MESSAGES,
  BUTTON_TEXT,
  LIST_SETTINGS,
} from "@src/constants/ui";
import { safeParseInt, safeString } from "@src/utils/errorUtils";
import {
  useMyPosts,
  useMyPagePagination,
  useMyPageLoadingState,
  useMyPageError,
} from "@src/hooks/useMyPageData";
import type { PostItem } from "@src/types/mypage";

interface PostListItemProps {
  post: PostItem;
  onClick?: () => void;
  index?: number;
  isExiting?: boolean;
}

// CSS transition-delay로 순차 등장 (setTimeout 제거)
const PostListItem: React.FC<PostListItemProps> = ({
  post,
  onClick,
  index = 0,
  isExiting = false,
}) => {
  // 안전한 데이터 처리
  const safePost = {
    id: safeParseInt(post?.id, 0),
    category: safeString(post?.category, "일반"),
    title: safeString(post?.title, "제목 없음"),
    date: safeString(post?.date, "날짜 없음"),
    views: safeParseInt(post?.views, 0),
    comments: safeParseInt(post?.comments, 0),
  };

  const safeIndex = Math.max(0, safeParseInt(index, 0));

  return (
    <div
      className={`flex items-center py-4 px-2 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform opacity-0 translate-x-8 animate-slide-in`}
      style={{
        // CSS로 순차 등장 효과 구현 (JavaScript 타이머 불필요)
        transitionDelay: `${safeIndex * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
        animationDelay: `${safeIndex * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
      }}
      onClick={() => !isExiting && onClick && onClick()}
      // 네비게이션 중복 방지
    >
      {/* 카테고리 */}
      <div className="w-16 flex-shrink-0">
        <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded">
          {safePost.category}
        </span>
      </div>

      {/* 제목 */}
      <div className="flex-1 px-4">
        <h3
          className={`text-base-content hover:text-primary transition-colors ${getDurationClass(
            ANIMATION_TIMINGS.HOVER_TRANSITION
          )} line-clamp-1`}
        >
          {safePost.title}
        </h3>
      </div>

      {/* 날짜 */}
      <div className="w-20 sm:w-24 text-right text-xs sm:text-sm text-neutral-content">
        {safePost.date}
      </div>
    </div>
  );
};

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);

  // setTimeout 정리를 위한 ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsErrorMessage,
    refetch: refetchPosts,
  } = useMyPosts(currentPage, LIST_SETTINGS.ITEMS_PER_PAGE);

  const { isAnyLoading } = useMyPageLoadingState();

  const { totalPages, onPageChange: handlePageChange } = useMyPagePagination(
    postsData,
    currentPage,
    setCurrentPage
  );

  // 에러 메시지 처리
  const { hasError, errorMessage, retry } = useMyPageError(
    postsErrorMessage,
    refetchPosts
  );

  // posts 변수 (기존 코드와 호환성을 위해 postsData.data를 posts로 정의)
  const posts = postsData?.data || [];
  const allPostsCount = postsData?.pagination?.totalItems || 0;

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // setTimeout 정리가 포함된 뒤로가기 핸들러
  const handleBackClick = () => {
    // 기존 timeout 정리
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

  // 컴포넌트 언마운트 시 setTimeout 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handlePostClick = (postId: number) => {
    console.log(`게시글 ${postId} 클릭`);
    // PATHS.POST_DETAIL의 실제 패턴에 맞춰 수정 필요
    // 일반적인 패턴들:
    navigate(`/posts/${postId}`); // 또는 `/post/${postId}` 또는 `/board/post/${postId}`
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
          count={allPostsCount}
          onBackClick={handleBackClick}
          isExiting={isExiting}
          isLoading={postsLoading || isAnyLoading}
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
          {(postsLoading || isAnyLoading) && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-primary loading-lg"></span>
              <p className="text-neutral-content text-sm mt-4">
                {LOADING_MESSAGES.POSTS}
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {hasError && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
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
                  onClick={retry}
                  className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                    ANIMATION_TIMINGS.HOVER_TRANSITION
                  )}`}
                >
                  {BUTTON_TEXT.RETRY}
                </button>
              </div>
            </div>
          )}

          {/* 정상 상태 - 게시글 목록 */}
          {!postsLoading && !hasError && postsData && (
            <>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onClick={() => handlePostClick(post.id)}
                    index={index}
                    isExiting={isExiting}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-neutral-content text-4xl mb-4">📝</div>
                  <h3 className="text-neutral-content text-lg font-medium mb-2">
                    {EMPTY_MESSAGES.POSTS}
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
                    {BUTTON_TEXT.WRITE}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {!postsLoading && !hasError && postsData && allPostsCount > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoaded={isLoaded}
            isExiting={isExiting}
          />
        )}
      </div>

      {/* 공통 CSS 애니메이션 컴포넌트 사용 */}
      <SlideInStyles />
    </>
  );
};

export default MyPosts;
