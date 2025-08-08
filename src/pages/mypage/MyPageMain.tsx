import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 카드 데이터 타입 정의
interface CardData {
  title: string;
  count: number;
  icon: string;
  path: string;
}

// 개별 카드 컴포넌트
interface CardProps {
  title: string;
  count: number;
  icon: string;
  onClick: () => void;
  isExpanding?: boolean;
  isClicked?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  count,
  icon,
  onClick,
  isExpanding,
  isClicked,
}) => {
  return (
    <div
      className={`bg-base-300 rounded-lg p-6 sm:p-8 hover:bg-opacity-80 transition-all duration-300 transform-gpu min-w-[200px] sm:min-w-[250px] min-h-[180px] sm:min-h-[220px] ${
        isExpanding
          ? isClicked
            ? "scale-150 z-20 opacity-100"
            : "scale-0 opacity-0"
          : "scale-100 opacity-100"
      }`}
      style={{
        transformOrigin: "center",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* 카드 헤더 - 제목과 플러스 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-medium text-base-content">
          {title}
        </h3>
        <button
          onClick={onClick}
          className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-focus transition-colors duration-200 group"
          aria-label={`${title} 전체보기`}
        >
          <span
            className="text-primary-content text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform duration-300"
            style={{
              transform: "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            }}
          >
            +
          </span>
        </button>
      </div>

      {/* 카드 내용 - 아이콘과 카운트 */}
      <div className="text-center">
        <div className="text-4xl sm:text-5xl mb-4">{icon}</div>
        <div className="text-3xl sm:text-4xl font-bold text-base-content">
          {count}
        </div>
      </div>
    </div>
  );
};

const MyPageMain: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanding, setIsExpanding] = useState(false);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  // 카드 데이터 (추후 API에서 가져올 데이터)
  const cardData: CardData[] = [
    {
      title: "작성글",
      count: 12,
      icon: "📝",
      path: "posts",
    },
    {
      title: "작성댓글",
      count: 45,
      icon: "💬",
      path: "comments",
    },
    {
      title: "북마크",
      count: 8,
      icon: "🔖",
      path: "bookmarks",
    },
  ];

  // 카드 클릭 핸들러 (두루마리 펼치기 애니메이션)
  const handleCardClick = (path: string) => {
    // 1. 클릭된 카드 표시
    setClickedCard(path);

    // 2. 확장 애니메이션 시작
    setIsExpanding(true);

    // 3. 애니메이션 완료 후 페이지 이동 (700ms → 400ms)
    setTimeout(() => {
      navigate(`/mypage/${path}`);
    }, 400);
  };

  return (
    <>
      <div className="p-4 sm:p-6 relative overflow-hidden">
        {/* 활동 섹션 헤더 */}
        <div
          className={`mb-6 transition-all duration-300 ${
            isExpanding
              ? "opacity-0 -translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-base-content mb-2">
            활동
          </h2>
          <div className="w-12 h-0.5 bg-primary rounded-full"></div>
        </div>

        {/* 카드 그리드 - 항상 가로 일렬 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
          {cardData.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              count={card.count}
              icon={card.icon}
              onClick={() => handleCardClick(card.path)}
              isExpanding={isExpanding}
              isClicked={clickedCard === card.path}
            />
          ))}
        </div>
      </div>

      {/* 두루마리 펼치기 효과 오버레이 */}
      {isExpanding && (
        <div
          className="fixed inset-0 bg-base-100 z-30"
          style={{
            animation:
              "expandFromCenter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
            animationFillMode: "forwards",
          }}
        />
      )}

      {/* 전역 CSS 애니메이션 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes expandFromCenter {
            0% {
              clip-path: polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%);
              transform: scale(0);
            }
            50% {
              clip-path: polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%);
              transform: scale(1);
            }
            100% {
              clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
              transform: scale(1);
            }
          }
        `,
        }}
      />
    </>
  );
};

export default MyPageMain;
