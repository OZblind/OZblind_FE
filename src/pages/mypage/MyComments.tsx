import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@src/components/commons/MyPage/PageHeader";
import Pagination from "@src/components/commons/MyPage/Pagination";
import {
  ANIMATION_TIMINGS,
  ANIMATION_CLASSES,
  getDurationClass,
} from "@constants/animations";

// 댓글 데이터 타입
interface CommentItem {
  id: number;
  postTitle: string;
  postCategory: string;
  commentContent: string;
  date: string;
  postId: number;
}

interface CommentListItemProps {
  comment: CommentItem;
  onClick?: () => void;
  index?: number; // delay 대신 index 사용 (CSS로 처리)
  isExiting?: boolean; // 네비게이션 가드용 추가
}

const CommentListItem: React.FC<CommentListItemProps> = ({
  comment,
  onClick,
  index = 0,
  isExiting = false,
}) => {
  return (
    <div
      className={`p-4 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform opacity-0 translate-x-8 animate-slide-in`}
      style={{
        // CSS로 순차 등장 효과 구현 (JavaScript 타이머 불필요)
        transitionDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
        animationDelay: `${index * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
      }}
      onClick={() => !isExiting && onClick?.()} // 네비게이션 중복 방지
    >
      {/* 원글 정보 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded">
          {comment.postCategory}
        </span>
        <h4 className="text-sm text-base-content font-medium line-clamp-1 flex-1">
          {comment.postTitle}
        </h4>
        <span className="text-xs text-neutral-content">{comment.date}</span>
      </div>

      {/* 댓글 내용 */}
      <div className="pl-4 border-l-2 border-primary/30">
        <p className="text-base-content text-sm line-clamp-2">
          {comment.commentContent}
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
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3; // 임시로 3페이지로 설정

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
      if (Math.random() < 0.1) {
        throw new Error("댓글 데이터를 불러오는데 실패했습니다.");
      }

      // 임시 댓글 데이터
      const dummyComments: CommentItem[] = [
        {
          id: 1,
          postTitle: "권권 후후 르르 ㅎㅎ ㅎㅎㅎ",
          postCategory: "자유",
          commentContent: "권후르 권후르~",
          date: "2024.01.15",
          postId: 1,
        },
        {
          id: 2,
          postTitle: "권후르~",
          postCategory: "질문",
          commentContent: "권후르가 밥사줌",
          date: "2024.01.14",
          postId: 2,
        },
        {
          id: 3,
          postTitle: "점심 뭐 먹을까 고민입니다",
          postCategory: "자유",
          commentContent: "불닭 볶음면",
          date: "2024.01.13",
          postId: 3,
        },
        {
          id: 4,
          postTitle: "회사 생활 처음인데 조언 구해요",
          postCategory: "익명",
          commentContent:
            "처음엔 다들 그래요. 너무 조급해하지 마시고 천천히 적응하시면 될 거예요. 화이팅!",
          date: "2024.01.12",
          postId: 4,
        },
        {
          id: 5,
          postTitle: "오늘 날씨 정말 좋네요",
          postCategory: "자유",
          commentContent:
            "정말이에요! 산책하기 딱 좋은 날씨네요. 저도 잠깐 나갔다 와야겠어요.",
          date: "2024.01.11",
          postId: 5,
        },
        {
          id: 6,
          postTitle: "신입이 물어보기 어려운 질문들",
          postCategory: "질문",
          commentContent:
            "궁금한 것은 바로바로 물어보는 게 좋아요. 선배들도 도와주고 싶어 하실 거예요!",
          date: "2024.01.10",
          postId: 6,
        },
      ];

      setComments(dummyComments);
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
    loadComments();
  }, []);

  // 뒤로가기 핸들러 (애니메이션 포함)
  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/mypage");
    }, ANIMATION_TIMINGS.PAGE_TRANSITION);
  };

  // 댓글 클릭 핸들러 (원글로 이동)
  const handleCommentClick = (postId: number) => {
    console.log(`원글 ${postId}로 이동`);
    // navigate(`/post/${postId}`);
  };

  // 재시도 핸들러
  const handleRetry = () => {
    loadComments();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log(`댓글 페이지 ${page}로 이동`);
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
                댓글을 불러오는 중...
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
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

          {/* 정상 상태 - 댓글 목록 */}
          {!isLoading && !error && (
            <>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <CommentListItem
                    key={comment.id}
                    comment={comment}
                    onClick={() => handleCommentClick(comment.postId)}
                    index={index} // delay 대신 index 전달
                    isExiting={isExiting} // 네비게이션 가드 전달
                  />
                ))
              ) : (
                // 빈 상태
                <div className="text-center py-12">
                  <div className="text-neutral-content text-4xl mb-4">💬</div>
                  <h3 className="text-neutral-content text-lg font-medium mb-2">
                    작성한 댓글이 없습니다
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
                    게시판 보기
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
    </>
  );
};

export default MyComments;
