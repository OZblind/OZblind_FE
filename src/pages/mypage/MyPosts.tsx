import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 게시글 데이터 타입
interface PostItem {
  id: number;
  category: string;
  title: string;
  date: string;
  views?: number;
  comments?: number;
}

// 개별 게시글 아이템 컴포넌트
interface PostListItemProps {
  post: PostItem;
  onClick?: () => void;
  delay?: number;
}

const PostListItem: React.FC<PostListItemProps> = ({
  post,
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
      className={`flex items-center py-4 px-2 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
      onClick={onClick}
    >
      {/* 카테고리 */}
      <div className="w-16 flex-shrink-0">
        <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded">
          {post.category}
        </span>
      </div>

      {/* 제목 */}
      <div className="flex-1 px-4">
        <h3 className="text-base-content hover:text-primary transition-colors line-clamp-1">
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

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 임시 게시글 데이터
  const posts: PostItem[] = [
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
    console.log(`게시글 ${postId} 클릭`);
    // 추후 상세 페이지로 이동
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
            작성글
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs sm:text-sm text-neutral-content">
            총 {posts.length}개
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

      {/* 게시글 목록 */}
      <div
        className={`bg-base-200 rounded-lg overflow-hidden transition-all duration-500 ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <PostListItem
              key={post.id}
              post={post}
              onClick={() => handlePostClick(post.id)}
              delay={isLoaded ? index * 50 : 0} // 순차적으로 나타나는 효과
            />
          ))
        ) : (
          // 빈 상태
          <div className="text-center py-12">
            <div className="text-neutral-content text-4xl mb-4">📝</div>
            <p className="text-neutral-content text-sm">
              작성한 글이 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {posts.length > 0 && (
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

export default MyPosts;
