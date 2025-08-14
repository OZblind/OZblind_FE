import type { FreeBoardItem } from "./PostRow";

type Props = {
  item: FreeBoardItem;
  onClick?: (id: FreeBoardItem["id"]) => void;
  className?: string;
};

export function PostCard({ item, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(item.id)}
      className={`w-full text-left rounded-xl border p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
      aria-label={`게시글 ${item.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className="
            font-medium leading-6
            [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden
          "
        >
          {item.title}
        </h3>
        {/* 등록일 (YY.MM.DD) */}
        <div className="shrink-0 text-right text-xs text-neutral-500">
          {item.dateText}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-300">
        <span className="truncate max-w-[40%]">{item.author}</span>
        <span aria-hidden>•</span>
        <span>조회 {item.views}</span>
        <span aria-hidden>•</span>
        <span>추천 {item.likes}</span>
        {typeof item.no !== "undefined" && (
          <>
            <span aria-hidden>•</span>
            <span className="text-neutral-500">No.{item.no}</span>
          </>
        )}
      </div>
    </button>
  );
}
