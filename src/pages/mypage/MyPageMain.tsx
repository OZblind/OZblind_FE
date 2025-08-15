import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@constants/paths";
import { ANIMATION_TIMINGS } from "@constants/animations";

// 카드 데이터 타입 정의 - icon을 ReactNode로 변경
interface CardData {
  title: string;
  count: number;
  icon: React.ReactNode;
  path: string;
  items: Array<{
    id: number;
    title: string;
    date: string;
    category?: string;
  }>;
}

// 개별 카드 컴포넌트
interface CardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  items?: Array<{
    id: number;
    title: string;
    date: string;
    category?: string;
  }>;
  onClick: () => void;
  isExpanding?: boolean;
  isClicked?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  count,
  icon,
  items = [],
  onClick,
  isExpanding,
  isClicked,
}) => {
  const getEmptyMessage = (title: string) => {
    switch (title) {
      case "작성글":
        return "작성한 글이 없습니다.";
      case "작성댓글":
        return "작성한 댓글이 없습니다.";
      case "북마크":
        return "북마크한 글이 없습니다.";
      default:
        return `${title ?? "항목"}이 없습니다.`;
    }
  };

  return (
    <div
      className={`bg-base-300 rounded-lg p-4 hover:bg-opacity-80 transition-all duration-300 transform-gpu flex-1 min-w-0 max-w-xs min-h-[350px] select-none ${
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
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-medium text-base-content">{title}</h3>
          <span className="text-sm text-neutral-content">({count})</span>
        </div>
        <button
          onClick={onClick}
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-focus transition-colors duration-200 group relative overflow-hidden"
          aria-label={`${title} 전체보기`}
        >
          {/* 플러스 아이콘 */}
          <div
            className="w-5 h-5 text-primary-content flex items-center justify-center transition-transform duration-300"
            style={{
              transform: "rotate(0deg) scale(1)",
              transition: "transform 0.3s ease",
              transformOrigin: "50% 50%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 3V13M3 8H13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* 카드 내용 */}
      <div className="space-y-3">
        {items && items.length > 0 ? (
          items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="p-3 bg-base-200 rounded-lg hover:bg-base-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {item.category && (
                  <span className="text-xs bg-base-300 px-2 py-1 rounded text-base-content">
                    {item.category}
                  </span>
                )}
                <span className="text-xs text-neutral-content">
                  {item.date}
                </span>
              </div>
              <h4
                className="text-sm text-base-content mt-2"
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {item.title}
              </h4>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-neutral-content text-3xl mb-2">{icon}</div>
            <p className="text-neutral-content text-sm">
              {getEmptyMessage(title)}
            </p>
          </div>
        )}

        {/* 더보기 표시 */}
        {items && items.length > 4 && (
          <div className="text-center py-2">
            <span className="text-xs text-neutral-content">
              외 {items.length - 4}개 더...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const MyPageMain: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanding, setIsExpanding] = useState(false);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  // setTimeout 대신 pendingPath로 안전한 네비게이션 관리
  const pendingPathRef = useRef<string | null>(null);

  // 카드 데이터
  const cardData: CardData[] = [
    {
      title: "작성글",
      count: 12,
      icon: "📝",
      path: "posts",
      items: [
        {
          id: 1,
          title: "안녕하세요 처음 가입했어요 ㅎㅎ ㅎㅎㅎ [21]",
          date: "01.15",
          category: "자유",
        },
      ],
    },
    {
      title: "작성댓글",
      count: 45,
      icon: "💬",
      path: "comments",
      items: [],
    },
    {
      title: "북마크",
      count: 8,
      icon: "🔖",
      path: "bookmarks",
      items: [],
    },
  ];
  const handleCardClick = (path: string) => {
    setClickedCard(path);
    setIsExpanding(true);
    pendingPathRef.current = `${PATHS.MYPAGE}/${path}`;
  };

  const handleOverlayAnimationEnd = () => {
    if (pendingPathRef.current) {
      navigate(pendingPathRef.current);
      pendingPathRef.current = null;
    }
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

        {/* 카드 그리드 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
          {cardData.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              count={card.count}
              icon={card.icon}
              items={card.items}
              onClick={() => handleCardClick(card.path)}
              isExpanding={isExpanding}
              isClicked={clickedCard === card.path}
            />
          ))}
        </div>
      </div>

      {/* ✅ setTimeout 제거: onAnimationEnd 이벤트로 안정적 네비게이션 */}
      {isExpanding && (
        <div
          className="fixed inset-0 bg-base-100 z-30"
          style={{
            animation: `expandFromCenter ${ANIMATION_TIMINGS.CARD_EXPAND}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
          }}
          onAnimationEnd={handleOverlayAnimationEnd}
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
