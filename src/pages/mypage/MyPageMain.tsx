// MyPageMain.tsx API 연결 버전 - 수정된 버전
import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@constants/paths";
import { ANIMATION_TIMINGS, ANIMATION_KEYFRAMES } from "@constants/animations";
import { LIST_SETTINGS, EMPTY_MESSAGES } from "@constants/ui";
import { useMyActivitySummary } from "@hooks/useMyPageData";
import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";

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
  getIconPath: (iconType: string) => string;
  onItemClick?: (id: number) => void;
}

const Card: React.FC<CardProps> = ({
  title,
  count,
  icon,
  items = [],
  onClick,
  isExpanding,
  isClicked,
  getIconPath,
  onItemClick,
}) => {
  const getEmptyMessage = (title: string) => {
    switch (title) {
      case "작성글":
        return EMPTY_MESSAGES.POSTS;
      case "작성댓글":
        return EMPTY_MESSAGES.COMMENTS;
      case "북마크":
        return EMPTY_MESSAGES.BOOKMARKS;
      default:
        return EMPTY_MESSAGES.FALLBACK;
    }
  };

  return (
    <div
      className={`bg-base-300/40 rounded-lg p-4 transition-all duration-300 transform-gpu flex-1 min-w-0 w-full max-w-sm h-[350px] select-none flex flex-col ${
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
      {/* 카드 헤더 - 고정 높이 */}
      <div className="flex items-center justify-between mb-4 h-[40px] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-2xl flex-shrink-0">
            {title === "북마크" ? (
              <img
                src={getIconPath("bookmark")}
                alt="북마크"
                className="w-6 h-6"
              />
            ) : title === "작성글" ? (
              <img
                src={getIconPath("writing")}
                alt="작성글"
                className="w-6 h-6"
              />
            ) : title === "작성댓글" ? (
              <img
                src={getIconPath("chat")}
                alt="작성댓글"
                className="w-6 h-6"
              />
            ) : (
              icon
            )}
          </span>
          <h3 className="text-lg font-medium text-base-content truncate">
            {title}
          </h3>
          <span className="text-sm text-neutral-content flex-shrink-0">
            ({count})
          </span>
        </div>
        <button
          onClick={onClick}
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-focus transition-colors duration-200 group relative overflow-hidden flex-shrink-0"
          aria-label={`${title} 전체보기`}
        >
          <div
            className="w-5 h-5 text-white flex items-center justify-center transition-transform duration-300"
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

      {/* 카드 내용 - 나머지 공간 차지 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {items && items.length > 0 ? (
          <div className="space-y-2 flex-1 overflow-hidden">
            {items.slice(0, LIST_SETTINGS.PREVIEW_ITEMS - 1).map((item) => (
              <div
                key={item.id}
                className="p-2 bg-base-200 rounded-lg hover:bg-base-100 transition-colors cursor-pointer overflow-hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick?.(item.id);
                }}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  {item.category && (
                    <span className="text-xs bg-base-300 px-1.5 py-0.5 rounded text-base-content flex-shrink-0">
                      {item.category}
                    </span>
                  )}
                  <span className="text-xs text-neutral-content flex-shrink-0">
                    {new Date(item.date).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="text-xs text-base-content line-clamp-2 break-all leading-tight h-8 overflow-hidden">
                  {item.title}
                </h4>
              </div>
            ))}
            {/* 더보기 표시 - 컴팩트하게 */}
            {items.length > LIST_SETTINGS.PREVIEW_ITEMS - 1 && (
              <div className="text-center py-1">
                <span className="text-xs text-neutral-content">
                  외 {items.length - (LIST_SETTINGS.PREVIEW_ITEMS - 1)}개 더...
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <div className="text-neutral-content text-2xl mb-2">
              {title === "북마크" ? (
                <img
                  src={getIconPath("bookmark")}
                  alt="북마크"
                  className="w-6 h-6 mx-auto"
                />
              ) : title === "작성글" ? (
                <img
                  src={getIconPath("writing")}
                  alt="작성글"
                  className="w-6 h-6 mx-auto"
                />
              ) : title === "작성댓글" ? (
                <img
                  src={getIconPath("chat")}
                  alt="작성댓글"
                  className="w-6 h-6 mx-auto"
                />
              ) : (
                icon
              )}
            </div>
            <p className="text-neutral-content text-xs leading-relaxed px-2">
              {getEmptyMessage(title)}
            </p>
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
  const pendingPathRef = useRef<string | null>(null);

  // API 훅 사용
  const { data: cardData, isLoading, error, refetch } = useMyActivitySummary();

  const themeIcon = useThemeIcon();

  const { writingIcon, chatIcon, bookmarkIcon } = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return {
      writingIcon: dark ? icons.writing?.light : icons.writing?.dark,
      chatIcon: dark ? icons.chat?.light : icons.chat?.dark,
      bookmarkIcon: dark
        ? icons.mypageBookmark?.light
        : icons.mypageBookmark?.dark,
    };
  }, [themeIcon]);

  const getIconPath = (iconType: string) => {
    switch (iconType) {
      case "writing":
        return writingIcon || "";
      case "chat":
        return chatIcon || "";
      case "bookmark":
        return bookmarkIcon || "";
      default:
        return "";
    }
  };

  const handlePostClick = (postId: number) => {
    // PATHS.POST_DETAIL을 사용하여 동적 경로 생성
    const postPath = PATHS.POST_DETAIL.replace(":id", postId.toString());
    navigate(postPath);
  };

  const handleCardClick = (path: string) => {
    setClickedCard(path);
    setIsExpanding(true);

    // path를 올바른 마이페이지 경로로 변환
    let targetPath: string;
    switch (path) {
      case "posts":
        targetPath = `${PATHS.MYPAGE}/${PATHS.MYPAGE_POSTS}`;
        break;
      case "comments":
        targetPath = `${PATHS.MYPAGE}/${PATHS.MYPAGE_COMMENTS}`;
        break;
      case "bookmarks":
        targetPath = `${PATHS.MYPAGE}/${PATHS.MYPAGE_BOOKMARKS}`;
        break;
      default:
        targetPath = `${PATHS.MYPAGE}/${path}`;
    }

    pendingPathRef.current = targetPath;
  };

  const handleOverlayAnimationEnd = () => {
    if (pendingPathRef.current) {
      navigate(pendingPathRef.current);
      pendingPathRef.current = null;
    }
  };

  const handleRetry = () => {
    refetch();
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 relative overflow-hidden">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-base-content mb-2">
            활동
          </h2>
          <div className="w-12 h-0.5 bg-primary rounded-full"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* 로딩 스켈레톤 */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-base-300/40 rounded-lg p-4 flex-1 min-w-0 max-w-xs min-h-[350px] animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-base-300 rounded"></div>
                  <div className="w-16 h-4 bg-base-300 rounded"></div>
                  <div className="w-8 h-4 bg-base-300 rounded"></div>
                </div>
                <div className="w-8 h-8 bg-base-300 rounded-full"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="p-3 bg-base-200 rounded-lg">
                    <div className="w-full h-3 bg-base-300 rounded mb-2"></div>
                    <div className="w-3/4 h-3 bg-base-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-4 sm:p-6 relative overflow-hidden">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-base-content mb-2">
            활동
          </h2>
          <div className="w-12 h-0.5 bg-primary rounded-full"></div>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-base-content mb-2">
            활동 정보를 불러오지 못했습니다
          </h3>
          <p className="text-neutral-content text-sm mb-6 max-w-md mx-auto">
            {error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다"}
          </p>
          <button
            onClick={handleRetry}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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

        {/* 카드 그리드 - 높이 통일 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-start relative">
          {cardData?.map((card, index) => (
            <Card
              key={`${card.title}-${index}`}
              title={card.title}
              count={card.count}
              icon={card.icon}
              items={card.items}
              onClick={() => handleCardClick(card.path)}
              onItemClick={handlePostClick}
              isExpanding={isExpanding}
              isClicked={clickedCard === card.path}
              getIconPath={getIconPath}
            />
          ))}
        </div>

        {/* 확장 오버레이 */}
        {isExpanding && (
          <div
            className="absolute inset-0 bg-base-100 z-30"
            style={{
              animation: `expandFromCenter ${ANIMATION_TIMINGS.CARD_EXPAND}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
              clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
            }}
            onAnimationEnd={handleOverlayAnimationEnd}
          />
        )}
      </div>

      {/* 애니메이션 스타일 */}
      {React.createElement("style", {
        dangerouslySetInnerHTML: {
          __html: ANIMATION_KEYFRAMES.EXPAND_FROM_CENTER,
        },
      })}
    </>
  );
};

export default MyPageMain;
