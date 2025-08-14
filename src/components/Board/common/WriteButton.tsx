type Props = {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode; // 라벨 커스터마이즈(기본: 글쓰기)
};

export function WriteButton({ onClick, className, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm
                  hover:bg-base-200 active:scale-[0.99] ${className ?? ""}`}
    >
      {/* 간단한 펜 아이콘 */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l8.06-8.06.92.92-8.06 8.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
      {children ?? "글쓰기"}
    </button>
  );
}
