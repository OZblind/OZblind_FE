export type EmptyStateProps = {
  message?: string; // 기본: "게시글이 없습니다."
  actionLabel?: string; // CTA 버튼 라벨 (선택)
  onAction?: () => void; // CTA 클릭 핸들러 (선택)
  icon?: React.ReactNode; // 아이콘 노드 (선택)
  className?: string;
};

export default function EmptyState({
  message = "게시글이 없습니다.",
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={`py-10 text-center ${className ?? ""}`}>
      <div className="mx-auto inline-flex flex-col items-center gap-3">
        {icon}
        <div className="text-sm text-base-content/60">{message}</div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="rounded-md border border-base-300 px-3 py-1 text-sm hover:bg-base-200/60"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
