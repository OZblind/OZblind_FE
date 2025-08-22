type Props = {
  onClick?: () => void;
  className?: string;
  label?: string;
};

export default function WriteButton({
  onClick,
  className,
  label = "글쓰기",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        // 기본 높이 36px (다른 아이콘 버튼과 동일)
        "inline-flex h-9 items-center gap-2 rounded-md border border-base-300 px-3 hover:bg-base-200/60",
        // ⬇380px 이하는 아이콘-only 28px 정사각
        "max-[380px]:size-7 max-[380px]:justify-center max-[380px]:p-1",
        className ?? "",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="currentColor"
        aria-hidden
        className="shrink-0"
      >
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5.5v-.42l8.66-8.66.42.42-8.66 8.66zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
      {/* xs에서는 라벨 숨김 → 아이콘만 */}
      <span className="max-[380px]:hidden">{label}</span>
    </button>
  );
}
