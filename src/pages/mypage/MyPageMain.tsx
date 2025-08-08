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
  isExiting?: boolean;
  delay?: number;
}

const Card: React.FC<CardProps> = ({
  title,
  count,
  icon,
  onClick,
  isExiting,
  delay = 0,
}) => {
  return (
    <div
      className={`bg-base-300 rounded-lg p-4 sm:p-6 hover:bg-opacity-80 transition-all duration-500 transform ${
        isExiting
          ? "opacity-0 scale-95 translate-x-8"
          : "opacity-100 scale-100 translate-x-0"
      }`}
      style={{
        transitionDelay: isExiting ? `${delay}ms` : "0ms",
        animationFillMode: "forwards",
      }}
    >
      {/* 카드 헤더 - 제목과 플러스 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-medium text-base-content">
          {title}
        </h3>
        <button
          onClick={onClick}
          className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-focus transition-colors duration-200 group"
          aria-label={`${title} 전체보기`}
        >
          <span className="text-primary-content text-sm sm:text-lg font-bold group-hover:scale-110 transition-transform duration-200">
            +
          </span>
        </button>
      </div>

      {/* 카드 내용 - 아이콘과 카운트 */}
      <div className="text-center">
        <div className="text-2xl sm:text-3xl mb-2">{icon}</div>
        <div className="text-xl sm:text-2xl font-bold text-base-content">
          {count}
        </div>
      </div>
    </div>
  );
};

const MyPageMain: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

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

  // 카드 클릭 핸들러 (애니메이션 포함)
  const handleCardClick = (path: string) => {
    // 1. 카드들이 사라지는 애니메이션 시작
    setIsExiting(true);

    // 2. 애니메이션 완료 후 페이지 이동
    setTimeout(() => {
      navigate(`/mypage/${path}`);
    }, 600); // 애니메이션 시간 + 여유시간
  };

  return (
    <div className="p-4 sm:p-6 overflow-hidden">
      {/* 활동 섹션 헤더 */}
      <div
        className={`mb-6 transition-all duration-500 ${
          isExiting ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-base-content mb-2">
          활동
        </h2>
        <div className="w-12 h-0.5 bg-primary rounded-full"></div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cardData.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            count={card.count}
            icon={card.icon}
            onClick={() => handleCardClick(card.path)}
            isExiting={isExiting}
            delay={index * 100} // 순차적으로 사라지는 효과
          />
        ))}
      </div>

      {/* 확장 애니메이션을 위한 오버레이 */}
      {isExiting && (
        <div
          className="fixed inset-0 bg-base-100 opacity-0 animate-fade-in pointer-events-none"
          style={{
            animation: "fadeIn 0.6s ease-out forwards",
            zIndex: -1,
          }}
        />
      )}
    </div>
  );
};

export default MyPageMain;
