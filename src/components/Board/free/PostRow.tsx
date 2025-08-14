export const FREE_LIST_GRID =
  "grid grid-cols-[64px_minmax(0,1fr)_96px_72px_72px_72px]";

export type FreeBoardItem = {
  id: string | number;
  no?: number;
  title: string;
  author: string;
  dateText: string; // YY.MM.DD
  views?: number | null | undefined;
  likes?: number | null | undefined;
};

type Props = {
  item: FreeBoardItem;
  onClick?: (id: FreeBoardItem["id"]) => void;
  className?: string;
};

export function PostRow({ item, onClick, className }: Props) {
  const views = Math.max(0, item.views ?? 0); // 음수/null/undefined → 0
  const likes = Math.max(0, item.likes ?? 0);

  return (
    <button
      type="button"
      onClick={() => onClick?.(item.id)}
      className={`${FREE_LIST_GRID} w-full items-center gap-2 rounded-md px-0 py-2 text-sm
                  hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
      aria-label={`게시글 ${item.title}`}
    >
      {/* 번호 */}
      <span className="block w-full text-center text-neutral-500">
        {item.no ?? "-"}
      </span>

      {/* 제목 */}
      <span className="block w-full truncate text-center font-medium">
        {item.title}
      </span>

      {/* 글쓴이 */}
      <span className="block w-full truncate text-center text-neutral-700 dark:text-neutral-200">
        {item.author}
      </span>

      {/* 등록일 */}
      <span className="block w-full text-center text-neutral-500">
        {item.dateText}
      </span>

      {/* 조회 / 추천 */}
      <span className="block w-full text-center tabular-nums">
        {String(views)}
      </span>
      <span className="block w-full text-center tabular-nums">
        {String(likes)}
      </span>
    </button>
  );
}
