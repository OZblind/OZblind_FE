import type { Notification } from "./notice.types";
import { toMdHm } from "./format";
import { buildNoticeCopy } from "./copy";
import { useTheme } from "./useTheme";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function NoticeCard({
  n,
  deleteMode,
  onDelete,
  onMarkRead,
}: {
  n: Notification;
  deleteMode: boolean;
  onDelete: () => void;
  onMarkRead: () => void;
}) {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const { snippet, suffix } = buildNoticeCopy(n);
  const detail = n.detail ?? "";
  const time = toMdHm(n.createdAt);
  const path = n.context?.path;
  const clickable = !deleteMode; // 삭제모드 아닐 때만 인터랙션

  const busyRef = useRef(false);
  const handleClick = () => {
    if (!clickable || busyRef.current) return;
    busyRef.current = true;
    if (!n.read) onMarkRead();
    if (path) navigate(path);
    setTimeout(() => {
      busyRef.current = false;
    }, 350);
  };

  const isSystem = n.type === "system"; // 공지(system) 구분
  const isQuoted = n.type !== "system"; // comment/reply만 따옴표

  // 툴팁 원문
  const rawForTitle =
    n.type === "comment"
      ? n.context?.title
      : n.type === "reply"
        ? n.context?.myComment
        : (n.text ?? "");

  const normalUnreadBg = isDark ? "bg-base-300" : "bg-base-200";
  const normalReadBg = "bg-base-200";
  const baseBgClass = isSystem
    ? n.read
      ? "bg-info/15 border-info/30"
      : "bg-info/30 border-info/50"
    : n.read
      ? `${normalReadBg} border-base-300`
      : `${normalUnreadBg} border-base-300`;

  // hover: 배경 색 고정 + "오버레이 레이어"만 아주 살짝(배경만) 보이게
  // - 클릭 가능한 상태에서만 적용
  const hoverOverlayClass = clickable
    ? isSystem
      ? "group-hover:bg-info/10"
      : isDark
        ? "group-hover:bg-white/5"
        : "group-hover:bg-black/5"
    : "";

  // 그림자: 읽음은 없음, 안 읽음만 hover 시 살짝 업(강도 낮게)
  const elevationBase = n.read ? "shadow-none" : "shadow-md";
  const elevationHover = !n.read && clickable ? "hover:shadow-md" : "";

  return (
    <article
      role={clickable ? (path ? "link" : "button") : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={[
        // 오버레이가 카드 안에서 깔끔하게 동작하도록 group/overflow-hidden 추가
        "relative group overflow-hidden rounded-xl border p-3 md:p-4 transition-all",
        baseBgClass,
        elevationBase,
        elevationHover,
        clickable ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
      onClick={handleClick}
      title={rawForTitle || undefined}
    >
      {/* 배경 오버레이: hover 시에만 살짝 보임 */}
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 rounded-xl transition-colors z-[0]",
          hoverOverlayClass || "bg-transparent",
        ].join(" ")}
      />

      {/* 삭제모드: 우상단 X */}
      {deleteMode && (
        <button
          type="button"
          aria-label="알림 삭제"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
          className="absolute right-2 top-2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center z-20 pointer-events-auto opacity-90 hover:opacity-100"
        >
          <span className="text-base text-primary-content leading-none">×</span>
        </button>
      )}

      {/* 안읽음 배지: 우상단(삭제모드 아닐 때만) */}
      {!n.read && !deleteMode && (
        <i
          aria-hidden
          className="absolute right-3 top-3 inline-block w-2 h-2 rounded-full bg-error z-[1]"
        />
      )}

      {/* 내용 영역 */}
      <div className="flex items-start gap-2 pr-8 relative z-[1]">
        <div className="min-w-0 w-full">
          {/* 1) 첫째 줄: “ + snippet(길어지면 … 처리) + ” + suffix(항상 보임) */}
          <div className="flex items-baseline whitespace-nowrap overflow-hidden text-xs md:text-sm text-base-content/70">
            {isQuoted && <span className="flex-none">“</span>}
            <span className="min-w-0 shrink truncate">{snippet}</span>
            {isQuoted && <span className="flex-none">”</span>}
            {suffix && <span className="flex-none pl-1">{suffix}</span>}
          </div>

          {/* 2) 둘째 줄 */}
          {detail && (
            <p className="mt-1 text-sm md:text-base text-base-content font-medium truncate">
              {detail}
            </p>
          )}

          {/* 3) 셋째 줄: 알림 발생 시각 */}
          <div className="mt-1 flex justify-end -mr-8">
            <time className="text-xs text-base-content/70">{time}</time>
          </div>
        </div>
      </div>
    </article>
  );
}
