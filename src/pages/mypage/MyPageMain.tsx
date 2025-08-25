import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@constants/paths";
import { ANIMATION_TIMINGS, ANIMATION_KEYFRAMES } from "@constants/animations";
import { LIST_SETTINGS, EMPTY_MESSAGES } from "@constants/ui";
import { useMyActivitySummary } from "@hooks/useMyPageData";
import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import type { MyPageCardItem } from "@src/types/mypage";

interface CardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  items?: MyPageCardItem[];
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
  const getEmptyMessage = (t: string) => {
    switch (t) {
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
      className={`bg-base-300/40 rounded-lg p-4 transition-all duration-300 transform-gpu flex-1 min-w-0 w-full h-[400px] select-none flex flex-col ${
        isExpanding
          ? isClicked
            ? "scale-150 z-20 opacity-100"
            : "scale-0 opacity-0"
          : "scale-100 opacity-100"
      }`}
      style={{ maxWidth: "400px", transformOrigin: "center" }}
    >
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between mb-4 h-[48px] flex-shrink-0">
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
          <h3 className="text-lg font-semibold text-base-content truncate">
            {title}
          </h3>
          <span className="text-sm text-neutral-content flex-shrink-0 bg-primary/10 px-2 py-1 rounded-full">
            {count}
          </span>
        </div>
        <button
          onClick={onClick}
          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-focus transition-colors"
          aria-label={`${title} 전체보기`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-white"
          >
            <path
              d="M8 3V13M3 8H13"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* 카드 내용 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {items.length > 0 ? (
          <div className="space-y-3 flex-1 overflow-hidden">
            {items.slice(0, LIST_SETTINGS.PREVIEW_ITEMS - 1).map((item) => {
              const targetId = item.postId ?? item.id;
              const disabled = !targetId;
              return (
                <div
                  key={item.title + String(item.id)}
                  className={`p-3 bg-base-200 rounded-lg border border-base-300/20 transition-colors ${
                    disabled
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-base-100 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (disabled) return;
                    onItemClick?.(targetId);
                  }}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    {item.category && (
                      <span className="text-xs bg-base-300 px-2 py-1 rounded text-base-content flex-shrink-0">
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
                  <h4 className="text-sm text-base-content line-clamp-2 font-medium">
                    {item.title}
                  </h4>
                </div>
              );
            })}
            {items.length > LIST_SETTINGS.PREVIEW_ITEMS - 1 && (
              <div className="text-center py-2">
                <span className="text-sm text-neutral-content bg-base-300/30 px-3 py-1 rounded-full">
                  외 {items.length - (LIST_SETTINGS.PREVIEW_ITEMS - 1)}개 더...
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 flex-1 flex flex-col justify-center">
            <div className="text-neutral-content text-3xl mb-3">
              <img
                src={getIconPath(
                  title === "작성글"
                    ? "writing"
                    : title === "작성댓글"
                    ? "chat"
                    : "bookmark"
                )}
                alt={title}
                className="w-8 h-8 mx-auto"
              />
            </div>
            <p className="text-neutral-content text-sm">
              {getEmptyMessage(title)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========== MyPageMain ========== */
const MyPageMain: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanding, setIsExpanding] = useState(false);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const pendingPathRef = useRef<string | null>(null);

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

  /* 중복 제거된 getIconPath */
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

  const handleItemClick = (postId: number) => {
    if (!postId) return;
    navigate(PATHS.POST_DETAIL.replace(":id", String(postId)));
  };

  const handleCardClick = (path: string) => {
    setClickedCard(path);
    setIsExpanding(true);

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

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p>활동 정보를 불러오지 못했습니다.</p>
        <button onClick={() => refetch()}>다시 시도</button>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start relative">
          {cardData?.map((card, index) => (
            <Card
              key={`${card.title}-${index}`}
              title={card.title}
              count={card.count}
              icon={card.icon}
              items={card.items}
              onClick={() => handleCardClick(card.path)}
              onItemClick={handleItemClick}
              isExpanding={isExpanding}
              isClicked={clickedCard === card.path}
              getIconPath={getIconPath} // 여기서 공용 함수 그대로 전달
            />
          ))}
        </div>

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

      {React.createElement("style", {
        dangerouslySetInnerHTML: {
          __html: ANIMATION_KEYFRAMES.EXPAND_FROM_CENTER,
        },
      })}
    </>
  );
};

export default MyPageMain;
