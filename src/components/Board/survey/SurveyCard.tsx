import clsx from "clsx";

/** UI 전용 칩 타입: 상위에서 Tag → Chip 매핑해서 내려줌 */
export type Chip = { id: string; label: string; color?: string };

export type SurveyStatus = "active" | "expired";

export type SurveyCardProps = {
  id: string;
  status: SurveyStatus;
  title: string;
  desc?: string;
  deadline: string;
  tags?: Chip[]; // ex. 11기(cohort) / Front(position) 등 2칩 예상
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
  onClick,
  className,
}: SurveyCardProps) {
  const expired = status === "expired";

  return (
    <article
      aria-disabled={expired}
      className={clsx(
        "relative h-full rounded-xl border border-base-300 bg-base-100 p-4 md:p-5 transition-colors",
        expired
          ? "opacity-60 cursor-default"
          : "hover:border-primary/50 cursor-pointer",
        className
      )}
      onClick={() => {
        if (!expired) onClick?.(id);
      }}
    >
      {/* 좌측 아이콘 자리 */}
      <div className="absolute left-4 top-4 h-10 w-10 md:h-12 md:w-12 rounded-md bg-purple-600/90" />

      {/* 상단 칩들 + 만료 라벨 */}
      <div className="pl-14 flex items-center gap-2">
        {tags?.map((t) => (
          <span
            key={t.id}
            className="badge badge-outline"
            style={
              t.color ? { borderColor: t.color, color: t.color } : undefined
            }
          >
            {t.label}
          </span>
        ))}
        {expired && <span className="badge badge-neutral">기간 만료</span>}
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

      {/* 하단 우측 마감일 */}
      <div className="mt-3 flex justify-end">
        <time dateTime={deadline} className="text-xs text-base-content/60">
          {fmtDeadline(deadline)}
        </time>
      </div>
    </article>
  );
}
