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
  /** 작성자 아래 한 줄 (예: “프론트엔드 11기”) */
  authorSubText?: React.ReactNode;
};

export default function PostRow({
  item,
  onClick,
  className,
  authorSubText,
}: Props) {
  const views = Math.max(0, item.views ?? 0);
  const likes = Math.max(0, item.likes ?? 0);

  return (
    <button
      type="button"
      onClick={() => onClick?.(item.id)}
      className={`${FREE_LIST_GRID} w-full items-center gap-2 rounded-md px-0 py-2 text-sm
                  hover:bg-base-200/60 focus:outline-none focus:ring-2 focus:ring-primary/40 ${className ?? ""}`}
      aria-label={`게시글 ${item.title}`}
    >
      {/* 번호 */}
      <span className="block w-full text-center text-base-content/60">
        {item.no ?? "-"}
      </span>

      {/* 제목 */}
      <span className="block w-full truncate text-center font-medium">
        {item.title}
      </span>

      {/* 글쓴이 + 서브텍스트 */}
      <span className="block w-full text-center text-base-content leading-tight">
        <span className="block truncate">{item.author}</span>
        {authorSubText ? (
          <span className="mt-0.5 block text-xs opacity-70 truncate">
            {authorSubText}
          </span>
        ) : null}
      </span>

      {/* 등록일 */}
      <span className="block w-full text-center text-base-content/60">
        {item.dateText}
      </span>

      {/* 조회 / 추천 */}
      <span className="block w-full text-center tabular-nums text-base-content">
        {String(views)}
      </span>
      <span className="block w-full text-center tabular-nums text-base-content">
        {String(likes)}
      </span>
    </button>
  );
}
