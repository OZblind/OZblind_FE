import { type MouseEvent } from "react";
import RepoPreviewThumb from "./RepoPreviewThumb";

export type GithubCardProps = {
  id: string;
  title: string;
  tagSlot?: React.ReactNode;
  /** 게시글 요약/설명 */
  excerpt?: string;
  /** 연결된 GitHub 레포 링크 (필수) */
  repoLink: string;
  /** 카드 전체 클릭 (게시글 상세 이동) */
  onClick?: (id: string) => void;
  /** 레포 링크 클릭 */
  onClickRepo?: (id: string) => void;
  /** 하단 메타 영역 (좋아요, 댓글 등 추가 시 사용) */
  metaSlot?: React.ReactNode;
  className?: string;
};

export default function GithubCard({
  id,
  title,
  tagSlot,
  excerpt,
  repoLink,
  onClick,
  onClickRepo,
  metaSlot,
  className = "",
}: GithubCardProps) {
  const handleCardClick = () => onClick?.(id);
  const handleRepoClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClickRepo?.(id);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      className={`rounded-xl border border-base-300 bg-base-100 hover:border-primary/50 hover:bg-base-200/40 transition-colors cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-4 p-3 md:p-4">
        {/* 좌측: GitHub 레포 썸네일 */}
        <div className="shrink-0 w-28 md:w-32 rounded-lg overflow-hidden">
          <RepoPreviewThumb repoLink={repoLink} display="auto" />
        </div>

        {/* 우측: 게시글 본문 */}
        <div className="min-w-0 flex-1">
          {tagSlot && (
            <div className="mb-1 flex items-center gap-2">{tagSlot}</div>
          )}

          <h3 className="text-base md:text-lg font-semibold truncate">
            {title}
          </h3>

          {excerpt && (
            <p className="mt-1 text-sm md:text-[15px] text-base-content/70 line-clamp-1 md:line-clamp-2">
              {excerpt}
            </p>
          )}

          <div className="mt-2 flex items-center gap-x-3 gap-y-1 text-xs md:text-[13px] text-base-content/60 min-w-0">
            {metaSlot}
            <button
              type="button"
              onClick={handleRepoClick}
              title={repoLink}
              className="hover:text-primary min-w-0 basis-0 flex-1 max-w-[320px] text-left truncate"
            >
              {repoLink}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
