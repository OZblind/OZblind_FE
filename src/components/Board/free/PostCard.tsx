import type { FreeBoardItem } from "./PostRow";

type Props = {
  item: FreeBoardItem;
  onClick?: (id: FreeBoardItem["id"]) => void;
  className?: string;
};

export function PostCard({ item, onClick, className }: Props) {
  const views = Math.max(0, item.views ?? 0); // 음수/null/undefined → 0
  const likes = Math.max(0, item.likes ?? 0);

  return (
    <button
      type="button"
      onClick={() => onClick?.(item.id)}
      className={[
        "w-full rounded-2xl border bg-base-100/40 hover:bg-base-200/40",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        "p-3 md:p-4 text-left max-[380px]:p-2",
        className ?? "",
      ].join(" ")}
      aria-label={`게시글 ${item.title}`}
    >
      {/* 제목 + 날짜 */}
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="min-w-0 font-semibold text-sm leading-tight line-clamp-2 max-[380px]:line-clamp-1 max-[380px]:text-[13px]">
          {item.title}
        </h3>
        <span className="shrink-0 text-[10px] text-neutral-400">
          {item.dateText}
        </span>
      </div>

      {/* 메타: [No · 작성자] / [추천 · 조회] 2열 그리드 */}
      <div className="mt-2 grid grid-cols-2 items-start gap-x-3 gap-y-1 text-xs max-[380px]:text-[11px] max-[380px]:mt-1">
        {/* 좌: No, 작성자 */}
        <div className="space-y-0.5">
          {item.no != null && (
            <div className="truncate text-neutral-400">No.{item.no}</div>
          )}
          <div className="truncate text-neutral-300">{item.author}</div>
        </div>

        {/* 우: 추천, 조회 (값 강조, 우측 정렬) */}
        <div className="space-y-0.5 text-right">
          <div className="truncate">
            <span className="text-neutral-400">추천 </span>
            <span className="font-medium text-neutral-100">
              {String(likes)}
            </span>
          </div>
          <div className="truncate">
            <span className="text-neutral-400">조회 </span>
            <span className="font-medium text-neutral-100">
              {String(views)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
