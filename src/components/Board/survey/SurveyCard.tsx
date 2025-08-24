import clsx from "clsx";
import AssignedTagList from "@components/tags/AssignedTagList";
import type { Tag } from "@src/types/tag";
import SurveyIcon from "@assets/images/survey.svg";
import type { ReactNode } from "react";

export type EmptyDescMode = "hide" | "placeholder" | "domain";

export type SurveyStatus = "active" | "expired";

export type SurveyCardProps = {
  id: string;
  status: SurveyStatus;
  title: string;
  desc?: string;
  deadline: string;
  tags?: Tag[];
  link?: string;
  onClick?: (id: string) => void;
  className?: string;

  /** 작성자 태그 배지를 주입할 선택 슬롯(옵션) */
  tagSlot?: ReactNode;
  /** desc가 없을 때 동작 (기본: 숨김) */
  emptyDescMode?: EmptyDescMode;
  /** emptyDescMode === "placeholder"일 때 표시할 문구 */
  emptyDescPlaceholder?: string;
};

function fmtDeadline(s: string) {
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return (
    d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }) + "까지"
  );
}

function getDomain(url?: string): string | undefined {
  if (!url) return;
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return;
  }
}

export default function SurveyCard({
  id,
  status,
  title,
  desc,
  deadline,
  tags,
  tagSlot,
  link,
  onClick,
  className,
  emptyDescMode = "hide",
  emptyDescPlaceholder = "본문 미리보기가 없습니다.", // TODO[API-DESC]: 목록 API가 excerpt 제공하면 이 폴백 제거
}: SurveyCardProps) {
  const expired = status === "expired";

  const descToShow =
    (desc && desc.trim()) ||
    (emptyDescMode === "domain" && getDomain(link)) ||
    (emptyDescMode === "placeholder" ? emptyDescPlaceholder : undefined);

  return (
    <article
      className={clsx(
        "relative rounded-xl border border-base-300 bg-base-100 px-4 py-3 md:px-4 md:py-4 transition-colors",
        "hover:border-primary/50 cursor-pointer",
        expired && "opacity-50 bg-base-300/20",
        className
      )}
      onClick={() => onClick?.(id)}
    >
      {/* 좌측 아이콘 */}
      <div className="absolute left-4 top-4 h-10 w-10 rounded-md overflow-hidden">
        <img src={SurveyIcon} alt="" className="h-full w-full object-cover" />
      </div>

      {/* 상단 칩(한 줄 고정) */}
      <div className="pl-14 flex items-center gap-2">
        {tags?.length ? (
          <AssignedTagList tags={tags} className="flex-nowrap" />
        ) : null}
        {tagSlot}
      </div>

      {/* 제목/설명 */}
      <div className="pl-14 mt-2">
        <h3 className="text-base md:text-lg font-semibold line-clamp-2">
          {title}
        </h3>

        {/* desc 폴백 표시 */}
        {descToShow && (
          <p className="mt-1 text-sm text-base-content/70 line-clamp-1">
            {descToShow}
          </p>
        )}
      </div>

      {/* 하단: 좌측 링크(줄임표) · 우측 마감일 */}
      <div className="mt-2 pl-14 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          {!!link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              title={link}
              className="block max-w-[320px] truncate text-xs text-base-content/60 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {link}
            </a>
          )}
        </div>

        <time
          dateTime={deadline}
          className="shrink-0 text-xs text-base-content/60"
        >
          {fmtDeadline(deadline)}
        </time>
      </div>
    </article>
  );
}
