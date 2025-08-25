import { useTheme } from "./useTheme";
import IconDeleteDark from "@assets/icons/icon-delete-dark.svg";
import IconDeleteLight from "@assets/icons/icon-delete-light.svg";
import IconDeleteOn from "@assets/icons/icon-delete.svg";
import type { CSSProperties } from "react";

type TooltipVars = CSSProperties & {
  /** DaisyUI tooltip custom properties */
  ["--tooltip-color"]?: string;
  ["--tooltip-text-color"]?: string;
};

export default function NoticeHeader({
  deleteMode,
  onToggleDeleteMode,
  onRequestClose,
  onMarkAllRead,
  onDeleteAll,
}: {
  deleteMode: boolean;
  onToggleDeleteMode: () => void;
  onRequestClose: () => void;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
}) {
  const { isDark } = useTheme();
  const icon = deleteMode
    ? IconDeleteOn
    : isDark
      ? IconDeleteDark
      : IconDeleteLight;
  const tip = deleteMode ? "삭제모드 해제" : "삭제모드";

  const tooltipStyle: TooltipVars = {
    "--tooltip-color": isDark ? "#2C2C2C" : "#1A1A1A",
    "--tooltip-text-color": "#F5F5F5",
  };

  return (
    <header
      className="relative z-10 flex-none h-12 px-3 md:px-4
                    border-b border-base-300 bg-base-200 md:rounded-t-2xl
                    flex items-center justify-between"
    >
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
          style={tooltipStyle}
        >
          <img src={icon} alt="" className="block w-4 h-4" />
          <span className="sr-only">{tip}</span>
        </button>

        {deleteMode ? (
          <button
            type="button"
            className="btn btn-error btn-xs text-white"
            onClick={onDeleteAll}
          >
            모두 삭제
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onMarkAllRead}
          >
            모두 읽음
          </button>
        )}

        {/* 모바일 full-height 닫기 */}
        <button
          type="button"
          onClick={onRequestClose}
          className="btn btn-ghost btn-sm md:hidden w-8 h-8 p-0 rounded-full"
          aria-label="알림 닫기"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </header>
  );
}
