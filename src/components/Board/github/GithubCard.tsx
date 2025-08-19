import { useState, type MouseEvent } from "react";
import { FaGithub } from "react-icons/fa";

export type GithubCardProps = {
  id: string;
  /** 좌측 썸네일 (실패 시 플레이스홀더로 대체) */
  thumbnail?: string;
  /** 레포명 (owner/repo) */
  repoName: string;
  /** 우측 상단 태그(예: Front), 왼쪽 배지(예: 11기)는 옵션으로 확장 가능 */
  ownerTag?: string;
  /** 한 줄/두 줄 설명 */
  desc?: string;
  /** 외부 링크(URL). 오른쪽 링크 아이콘/텍스트에 바인딩 */
  href?: string;
  /** 링크 아이콘/텍스트 클릭 콜백 */
  onClickLink?: (id: string) => void;
  /** 카드 전체 클릭 콜백 */
  onClick?: (id: string) => void;
};

export default function GithubCard({
  id,
  thumbnail,
  repoName,
  ownerTag,
  desc,
  href,
  onClickLink,
  onClick,
}: GithubCardProps) {
  const [imgError, setImgError] = useState(false);

  const handleCardClick = () => onClick?.(id);
  const handleLinkClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClickLink?.(id);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      className="rounded-xl border bg-base-100 hover:bg-base-200/40 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3 p-3 md:p-4">
        {/* 썸네일 */}
        <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-base-200 flex items-center justify-center">
          {!imgError && thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <FaGithub className="opacity-50" size={24} />
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* 예시 배지: 11기 (필요 시 props로 확장 가능) */}
            <span className="inline-flex items-center px-2 h-6 rounded-full text-xs bg-primary/10 text-primary font-medium">
              11 기
            </span>
            {ownerTag && (
              <span className="inline-flex items-center px-2 h-6 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">
                {ownerTag}
              </span>
            )}
          </div>

          <h3 className="text-base md:text-lg font-semibold truncate">
            {repoName}
          </h3>

          {desc && (
            <p className="mt-0.5 text-sm md:text-[15px] text-base-content/70 line-clamp-1 md:line-clamp-2">
              {desc}
            </p>
          )}

          {/* 하단 메타 */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-[13px] text-base-content/60">
            {/* 예시: 좋아요/코멘트 등 메타가 생기면 여기에 추가 */}
            {href && (
              <button
                type="button"
                onClick={handleLinkClick}
                className="underline decoration-dotted underline-offset-2 hover:text-primary"
                title={href}
              >
                {href}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
