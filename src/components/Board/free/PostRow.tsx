export type FreeBoardItem = {
  id: string | number;
  no?: number; // 글 번호(선택)
  title: string;
  author: string;
  dateText: string; // YY.MM.DD 형식 문자열
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
      className={`group grid grid-cols-12 w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
      aria-label={`게시글 ${item.title}`}
    >
      {/* 번호 */}
      <span className="col-span-1 text-center text-neutral-500">
        {item.no ?? "-"}
      </span>

      {/* 제목 */}
      <span className="col-span-5 truncate font-medium text-left">
        {item.title}
      </span>

      {/* 글쓴이 */}
      <span className="col-span-2 truncate text-neutral-700 dark:text-neutral-200">
        {item.author}
      </span>

      {/* 등록일 (YY.MM.DD) */}
      <span className="col-span-2 text-neutral-500">{item.dateText}</span>

      {/* 조회 */}
      <span className="col-span-1 text-right tabular-nums">{item.views}</span>

      {/* 추천 */}
      <span className="col-span-1 text-right tabular-nums">{item.likes}</span>
    </button>
  );
}
