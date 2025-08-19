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
  PAGINATION,
  SIMULATION,
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  EMPTY_MESSAGES,
  BUTTON_TEXT,
} from "@src/constants/ui";
import {
  safeCallback,
  normalizeError,
  safeParseInt,
  safeString,
} from "@src/utils/errorUtils";
import { mockComments } from "@src/mocks/mypage.mock";
import type { CommentItem } from "@src/types/mypage";

interface CommentListItemProps {
  comment: CommentItem;
  onClick?: () => void;
  index?: number;
  isExiting?: boolean;
}

// CSS transition-delay로 순차 등장 (setTimeout 제거)
const CommentListItem: React.FC<CommentListItemProps> = ({
  comment,
  onClick,
  index = 0,
  isExiting = false,
}) => {
  // 안전한 콜백 처리
  const handleClick = safeCallback(onClick);

  // 안전한 데이터 처리
  const safeComment = {
    id: safeParseInt(comment?.id, 0),
    postTitle: safeString(comment?.postTitle, "제목 없음"),
    postCategory: safeString(comment?.postCategory, "일반"),
    commentContent: safeString(comment?.commentContent, "내용 없음"),
    date: safeString(comment?.date, "날짜 없음"),
    postId: safeParseInt(comment?.postId, 0),
  };

  const safeIndex = Math.max(0, safeParseInt(index, 0));

  return (
    <div
      className={`p-4 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform opacity-0 translate-x-8 animate-slide-in`}
      style={{
        // CSS로 순차 등장 효과 구현 (JavaScript 타이머 불필요)
        transitionDelay: `${safeIndex * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
        animationDelay: `${safeIndex * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
      }}
      onClick={() => !isExiting && handleClick && handleClick()} // 네비게이션 중복 방지
    >
      {/* 원글 정보 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded">
          {safeComment.postCategory}
        </span>
        <h4 className="text-sm text-base-content font-medium line-clamp-1 flex-1">
          {safeComment.postTitle}
        </h4>
        <span className="text-xs text-neutral-content">{safeComment.date}</span>
      </div>

      {/* 댓글 내용 */}
      <div className="pl-4 border-l-2 border-primary/30">
        <p className="text-base-content text-sm line-clamp-2">
          {safeComment.commentContent}
        </p>
      </div>
    </div>
  );
};

const MyComments: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 간단한 상태 관리
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);
  const totalPages = PAGINATION.DEFAULT_TOTAL_PAGES.COMMENTS;

  // setTimeout 정리를 위한 ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 댓글 데이터 로딩 함수
  const loadComments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 시뮬레이션: 네트워크 지연
      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_TIMINGS.LOADING_DELAY)
      );

      // 시뮬레이션: 가끔 에러 발생 (테스트용)
      if (Math.random() < SIMULATION.ERROR_PROBABILITY) {
        throw new Error(ERROR_MESSAGES.LOAD_COMMENTS);
      }

      // 목업 데이터 사용 (타입 안전성 확보)
      setComments(mockComments);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = normalizeError(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadComments();
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

  // 댓글 클릭 핸들러 (원글로 이동) - 안전성 개선
  const handleCommentClick = (postId: number) => {
    const safePostId = safeParseInt(postId, 0);
    if (safePostId > 0) {
      console.log(`원글 ${safePostId}로 이동`);
      // navigate(`/post/${safePostId}`);
    }
  };

  // 재시도 핸들러 (안전한 에러 처리)
  const handleRetry = async () => {
    try {
      await loadComments();
    } catch (error) {
      console.error("재시도 중 오류 발생:", error);
      setError(normalizeError(error));
    }
  };

  // 페이지 변경 핸들러 (안전성 개선)
  const handlePageChange = (page: number) => {
    const safePage = safeParseInt(page, 1);
    if (safePage >= 1 && safePage <= totalPages) {
      setCurrentPage(safePage);
      console.log(`댓글 페이지 ${safePage}로 이동`);
    }
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
        {/* PageHeader 컴포넌트 */}
        <PageHeader
          title="작성댓글"
          count={comments.length}
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
                {LOADING_MESSAGES.COMMENTS}
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-base-content mb-2">
                {ERROR_MESSAGES.GENERAL}
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
                  {BUTTON_TEXT.BACK}
                </button>
                <button
                  onClick={handleRetry}
                  className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                    ANIMATION_TIMINGS.HOVER_TRANSITION
                  )}`}
                >
                  {BUTTON_TEXT.RETRY}
                </button>
              </div>
            </div>
          )}

          {/* 정상 상태 - 댓글 목록 */}
          {!isLoading && !error && (
            <>
              {comments && comments.length > 0 ? (
                comments.map((comment, index) => (
                  <CommentListItem
                    key={comment?.id || index}
                    comment={comment}
                    onClick={() => handleCommentClick(comment?.postId)}
                    index={index}
                    isExiting={isExiting}
                  />
                ))
              ) : (
                // 빈 상태
                <div className="text-center py-12">
                  <div className="text-neutral-content text-4xl mb-4">💬</div>
                  <h3 className="text-neutral-content text-lg font-medium mb-2">
                    {EMPTY_MESSAGES.COMMENTS}
                  </h3>
                  <p className="text-neutral-content text-sm mb-6">
                    다른 사람의 글에 댓글을 남겨보세요!
                  </p>
                  <button
                    onClick={() => navigate("/board")}
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

        {/* 페이지네이션 - 데이터가 있을 때만 표시 */}
        {!isLoading && !error && comments.length > 0 && (
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

export default MyComments;
