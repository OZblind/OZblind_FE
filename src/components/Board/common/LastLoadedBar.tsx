type Props = {
  lastLoadedAt?: string | Date;
  onRefresh?: () => void;
  className?: string;
};

export function LastLoadedBar({ lastLoadedAt, onRefresh, className }: Props) {
  const text =
    typeof lastLoadedAt === "string"
      ? lastLoadedAt
      : lastLoadedAt
        ? lastLoadedAt.toLocaleString()
        : "-";

  return (
    <div
      className={`flex items-center justify-between py-2 text-xs text-neutral-500 dark:text-neutral-400 ${className ?? ""}`}
    >
      <span>
        마지막으로 게시글 불러온 시각:{" "}
        <strong className="text-neutral-700 dark:text-neutral-200">
          {text}
        </strong>
      </span>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800"
          aria-label="새로고침"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
            <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1a6 6 0 1 1-1.64-6.41L14 10h6V4z" />
          </svg>
          새로고침
        </button>
      )}
    </div>
  );
}
