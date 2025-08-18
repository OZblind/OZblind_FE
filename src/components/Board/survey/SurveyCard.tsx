import clsx from "clsx";
import AssignedTagList from "@components/tags/AssignedTagList";
import type { Tag } from "@src/types/tag";
import SurveyIcon from "@assets/images/survey.svg";

export type SurveyStatus = "active" | "expired";

export type SurveyCardProps = {
  id: string;
  status: SurveyStatus;
  title: string;
  desc?: string;
  deadline: string; // ISO or formatted
  tags?: Tag[]; // 지정 태그 2개
  link?: string; // 설문 링크
  onClick?: (id: string) => void;
  className?: string;
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

export default function SurveyCard({
  id,
  status,
  title,
  desc,
  deadline,
  tags,
  link, // ✅
  onClick,
  className,
}: SurveyCardProps) {
  const expired = status === "expired";

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
      <div className="pl-14">
        {tags?.length ? (
          <AssignedTagList tags={tags} className="flex-nowrap" />
        ) : null}
      </div>

      {/* 제목/설명 */}
      <div className="pl-14 mt-2">
        <h3 className="text-base md:text-lg font-semibold line-clamp-2">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-sm text-base-content/70 line-clamp-1">
            {desc}
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
              onClick={(e) => e.stopPropagation()} // 카드 onClick과 분리
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
