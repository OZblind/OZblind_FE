import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 댓글 데이터 타입
interface CommentItem {
  id: number;
  postTitle: string;
  postCategory: string;
  commentContent: string;
  date: string;
  postId: number;
}

// 개별 댓글 아이템 컴포넌트
interface CommentListItemProps {
  comment: CommentItem;
  onClick?: () => void;
  delay?: number;
}

const CommentListItem: React.FC<CommentListItemProps> = ({
  comment,
  onClick,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`p-4 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
      onClick={onClick}
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

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 임시 댓글 데이터
  const comments: CommentItem[] = [
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

  // 뒤로가기 핸들러 (애니메이션 포함)
  const handleBackClick = () => {
    // 1. 사라지는 애니메이션 시작
    setIsExiting(true);

    // 2. 애니메이션 완료 후 페이지 이동
    setTimeout(() => {
      navigate("/mypage");
    }, 400);
  };

  // 댓글 클릭 핸들러 (원글로 이동)
  const handleCommentClick = (postId: number) => {
    console.log(`원글 ${postId}로 이동`);
    // 추후 원글 상세 페이지로 이동
    // navigate(`/post/${postId}`);
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
            작성댓글
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs sm:text-sm text-neutral-content">
            총 {comments.length}개
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

      {/* 댓글 목록 */}
      <div
        className={`bg-base-200 rounded-lg overflow-hidden transition-all duration-500 ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <CommentListItem
              key={comment.id}
              comment={comment}
              onClick={() => handleCommentClick(comment.postId)}
              delay={isLoaded ? index * 50 : 0} // 순차적으로 나타나는 효과
            />
          ))
        ) : (
          // 빈 상태
          <div className="text-center py-12">
            <div className="text-neutral-content text-4xl mb-4">💬</div>
            <p className="text-neutral-content text-sm">
              작성한 댓글이 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {comments.length > 0 && (
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

export default MyComments;
