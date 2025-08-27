import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@src/components/commons/MyPage/PageHeader";
import Pagination from "@src/components/commons/MyPage/Pagination";
import {
  ANIMATION_TIMINGS,
  ANIMATION_CLASSES,
  getDurationClass,
  SlideInStyles,
} from "@constants/animations";
import type { MyPageCommentItem } from "@api/mypageApi";
import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import {
  useMyComments,
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

interface CommentListItemProps {
  comment: MyPageCommentItem;
  onPostClick?: () => void;
  index?: number;
  isExiting?: boolean;
  getCommentIconPath: () => string;
}

/** [[NICK]]닉네임[[/NICK]]본문 → "닉네임: 본문" */
function formatCommentContent(raw?: string) {
  const text = String(raw ?? "");
  const OPEN = "[[NICK]]";
  const CLOSE = "[[/NICK]]";
  if (!text.startsWith(OPEN)) return text;
  const end = text.indexOf(CLOSE);
  if (end === -1) return text;
  const nick = text.substring(OPEN.length, end).trim();
  const content = text.substring(end + CLOSE.length).trim();
  return nick ? `${nick}: ${content}` : content;
}

const CommentListItem: React.FC<CommentListItemProps> = ({
  comment,
  onPostClick,
  index = 0,
  isExiting = false,
  getCommentIconPath,
}) => {
  const handleRowClick = () => {
    if (isExiting || !comment.postId) return;
    onPostClick?.();
  };

  return (
    <div
      className="transition-all duration-500 transform opacity-0 translate-x-8 animate-slide-in"
      style={{
        transitionDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
        animationDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
      }}
    >
      <div
        className="flex flex-col py-4 px-4 border-b border-base-300 hover:bg-base-200 cursor-pointer"
        onClick={handleRowClick}
      >
        {/* 상단: 게시글 정보 */}
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded">
            {comment.postCategory}
          </span>
          <h3
            className={`flex-1 text-base-content hover:text-primary transition-colors ${getDurationClass(
              ANIMATION_TIMINGS.HOVER_TRANSITION
            )} line-clamp-1 font-medium`}
          >
            {comment.postTitle}
          </h3>
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={getCommentIconPath()} alt="댓글" className="w-5 h-5" />
          </div>
        </div>

        {/* 하단: 댓글 내용과 날짜 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="pl-4 border-l-2 border-primary/30">
              <p className="text-base-content text-sm leading-relaxed break-words">
                {formatCommentContent(comment.commentContent)}
              </p>
            </div>
          </div>
          <div className="text-xs text-neutral-content flex-shrink-0 min-w-fit">
            {new Date(comment.date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyComments: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  /** UI 페이지 번호 (1 = 최신 페이지) */
  const [uiPage, setUiPage] = useState(1);

  /** 서버에서 받은 전체 페이지 수를 저장 */
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const themeIcon = useThemeIcon();

  const commentIcon = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return dark ? icons.chat?.light : icons.chat?.dark;
  }, [themeIcon]);

  const getCommentIconPath = () => commentIcon || "";

  /** 서버로 요청할 실제 페이지 번호
   * totalPages를 알기 전에는 uiPage(=1)를 그대로 요청,
   * 알게 되면 뒤집어서(totalPages - uiPage + 1) 요청
   */
  const serverPageToFetch = useMemo(() => {
    if (!totalPages || totalPages <= 0) return uiPage;
    return Math.max(1, Math.min(totalPages, totalPages - uiPage + 1));
  }, [totalPages, uiPage]);

  const {
    data: commentsData,
    isLoading: commentsLoading,
    error: commentsErrorMessage,
    refetch: refetchComments,
  } = useMyComments(serverPageToFetch, LIST_SETTINGS.ITEMS_PER_PAGE);

  const { isAnyLoading } = useMyPageLoadingState();
  const { hasError, errorMessage, retry } = useMyPageError(
    commentsErrorMessage,
    refetchComments
  );

  /** 서버 응답에서 totalPages 동기화 */
  useEffect(() => {
    const tp = commentsData?.pagination?.totalPages;
    if (typeof tp === "number" && tp > 0) {
      setTotalPages((prev) => (prev === tp ? prev : tp));
      // UI 페이지가 범위를 벗어나면 보정
      if (uiPage < 1 || (tp && uiPage > tp)) {
        setUiPage(1);
      }
    }
  }, [commentsData, uiPage]);

  /** 리스트(페이지 내부)는 최신순 정렬(안전망) */
  const comments = useMemo(() => {
    const raw = commentsData?.data || [];
    return [...raw].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [commentsData]);

  const allCommentsCount = commentsData?.pagination?.totalItems || 0;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 게시글 삭제 감지를 위한 주기적 리패치
  useEffect(() => {
    const interval = setInterval(() => {
      refetchComments();
    }, 30000); // 30초마다 서버 확인

    const handleFocus = () => refetchComments();
    const handleVisibilityChange = () => {
      if (!document.hidden) refetchComments();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetchComments]);

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

  /** UI 페이지 변경 핸들러 (1=최신) */
  const handlePageChange = useCallback(
    (nextUiPage: number) => {
      const tp = totalPages ?? commentsData?.pagination?.totalPages ?? 1;
      const clamped = Math.max(1, Math.min(tp, nextUiPage));
      setUiPage(clamped);
      // 필요 시 스크롤 상단 이동 등 추가 가능
    },
    [totalPages, commentsData]
  );

  const totalPagesForUI =
    totalPages ?? commentsData?.pagination?.totalPages ?? 1;

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
          title="작성댓글"
          count={allCommentsCount}
          onBackClick={handleBackClick}
          isExiting={isExiting}
          isLoading={commentsLoading || isAnyLoading}
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
          {(commentsLoading || isAnyLoading) && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-primary loading-lg"></span>
              <p className="text-neutral-content text-sm mt-4">
                {LOADING_MESSAGES.COMMENTS}
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {hasError && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                <img
                  src={getCommentIconPath()}
                  alt="댓글"
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

          {/* 정상 상태 - 댓글 목록 */}
          {!commentsLoading && !hasError && commentsData && (
            <>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <CommentListItem
                    key={comment.id}
                    comment={comment}
                    onPostClick={() => handlePostClick(comment.postId)}
                    index={index}
                    isExiting={isExiting}
                    getCommentIconPath={getCommentIconPath}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-neutral-content text-4xl mb-4">
                    <img
                      src={getCommentIconPath()}
                      alt="댓글"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
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

        {/* 페이지네이션 (UI 기준: 1=최신) */}
        {!commentsLoading &&
          !hasError &&
          commentsData &&
          allCommentsCount > 0 && (
            <Pagination
              currentPage={uiPage}
              totalPages={totalPagesForUI}
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

export default MyComments;
