type Props = {
  lastLoadedAt?: string;
  onRefresh?: () => void;
  className?: string;
  /** 글자/여백을 줄인 컴팩트 모드 */
  compact?: boolean;
  /** 새로고침 버튼을 "아이콘만 원형"으로 표시 */
  iconOnly?: boolean;
};

export function LastLoadedBar({
  lastLoadedAt,
  onRefresh,
  className,
  compact = true,
  iconOnly = true,
}: Props) {
  return (
    <div
      className={`flex items-center gap-2 ${compact ? "py-1 text-xs" : "py-2 text-xs"} ${className ?? ""} text-base-content/60`}
    >
      <span>
        마지막으로 게시글 불러온 시각:{" "}
        <strong className="text-base-content">{lastLoadedAt ?? "-"}</strong>
      </span>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          aria-label="새로고침"
          className={
            iconOnly
              ? "inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-base-300 hover:bg-base-200/60 text-base-content"
              : "inline-flex items-center gap-1 rounded-md border border-base-300 px-2 py-1 hover:bg-base-200/60 text-base-content"
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1a6 6 0 1 1-1.64-6.41L14 10h6V4z" />
          </svg>
          {!iconOnly && "새로고침"}
        </button>
      )}
    </div>
  );
}
