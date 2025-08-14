import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@src/components/commons/MyPage/PageHeader";

// 게시글 데이터 타입
interface PostItem {
  id: number;
  category: string;
  title: string;
  date: string;
  views?: number;
  comments?: number;
}

// 개별 게시글 아이템 컴포넌트 (변경 없음)
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

  // 간단한 상태 관리 추가
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 게시글 데이터 로딩 함수
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 시뮬레이션: 네트워크 지연
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 시뮬레이션: 가끔 에러 발생 (테스트용)
      if (Math.random() < 0.1) {
        // 10% 확률로 에러
        throw new Error("서버에서 데이터를 가져오는데 실패했습니다.");
      }

      // 임시 게시글 데이터
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

  // 초기 데이터 로딩
  useEffect(() => {
    loadPosts();
  }, []);

  // 뒤로가기 핸들러 (애니메이션 포함)
  const handleBackClick = () => {
    setIsExiting(true);
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

  // 재시도 핸들러
  const handleRetry = () => {
    loadPosts();
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
      {/* 기존 헤더 코드를 PageHeader 컴포넌트로 교체 */}
      <PageHeader
        title="작성글"
        count={posts.length}
        onBackClick={handleBackClick}
        isExiting={isExiting}
        isLoading={isLoading}
        hasError={!!error}
      />

      {/* 메인 컨텐츠 - 나머지는 그대로 유지 */}
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

        {/* 정상 상태 - 게시글 목록 */}
        {!isLoading && !error && (
          <>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <PostListItem
                  key={post.id}
                  post={post}
                  onClick={() => handlePostClick(post.id)}
                  delay={isLoaded ? index * 50 : 0}
                />
              ))
            ) : (
              // 빈 상태
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
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  글쓰기
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 페이지네이션 - 데이터가 있을 때만 표시 */}
      {!isLoading && !error && posts.length > 0 && (
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
