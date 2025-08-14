export const FREE_LIST_GRID = "grid grid-cols-[64px_1fr_160px_100px_80px_80px]"; // 번호/제목/글쓴이/등록일/조회/추천

export type FreeBoardItem = {
  id: string | number;
  no?: number;
  title: string;
  author: string;
  dateText: string; // YY.MM.DD
  views: number;
  likes: number;
};

type Props = {
  item: FreeBoardItem;
  onClick?: (id: FreeBoardItem["id"]) => void;
  className?: string;
};

export function PostRow({ item, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(item.id)}
      className={`${FREE_LIST_GRID} w-full items-center gap-2 rounded-md px-3 py-2 text-sm
                  hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
      aria-label={`게시글 ${item.title}`}
    >
      <span className="text-center text-neutral-500">{item.no ?? "-"}</span>
      <span className="truncate font-medium text-left">{item.title}</span>
      <span className="truncate text-neutral-700 dark:text-neutral-200">
        {item.author}
      </span>
      <span className="text-neutral-500">{item.dateText}</span>
      <span className="text-right tabular-nums">{item.views}</span>
      <span className="text-right tabular-nums">{item.likes}</span>
    </button>
  );
}
