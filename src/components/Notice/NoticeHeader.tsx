import { useTheme } from "./useTheme";
import IconDeleteDark from "@assets/icons/icon-delete-dark.svg";
import IconDeleteLight from "@assets/icons/icon-delete-light.svg";
import IconDeleteOn from "@assets/icons/icon-delete.svg";

export default function NoticeHeader({
  deleteMode,
  onToggleDeleteMode,
  onRequestClose,
}: {
  deleteMode: boolean;
  onToggleDeleteMode: () => void;
  onRequestClose: () => void;
}) {
  const { isDark } = useTheme();
  const icon = deleteMode
    ? IconDeleteOn
    : isDark
      ? IconDeleteDark
      : IconDeleteLight;
  const tip = deleteMode ? "삭제모드 해제" : "삭제모드";

  return (
    <header className="h-12 px-3 md:px-4 border-b border-base-300 flex items-center justify-between">
      <h2 id="notice-title" className="text-base md:text-lg font-semibold">
        알림
      </h2>

      <div className="flex items-center gap-1 md:gap-2">
        {/* 삭제모드 토글 */}
        <button
          type="button"
          onClick={onToggleDeleteMode}
          className="btn btn-ghost btn-xs tooltip tooltip-bottom"
          data-tip={tip}
          aria-pressed={deleteMode}
          aria-label={tip}
        >
          <img src={icon} alt="" className="block w-4 h-4" />
          <span className="sr-only">{tip}</span>
        </button>

        {deleteMode ? <DeleteAllButton /> : <MarkAllReadButton />}

        {/* 모바일 full-height 닫기 */}
        <button
          type="button"
          onClick={onRequestClose}
          className="btn btn-ghost btn-xs md:hidden w-6 h-6 p-0 rounded-full"
          aria-label="알림 닫기"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </header>
  );
}

function MarkAllReadButton() {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-xs"
      aria-label="모두 읽음 처리"
    >
      모두 읽음
    </button>
  );
}

function DeleteAllButton() {
  return (
    <button
      type="button"
      className="btn btn-error btn-xs text-error-content"
      aria-label="모두 삭제"
    >
      모두 삭제
    </button>
  );
}
