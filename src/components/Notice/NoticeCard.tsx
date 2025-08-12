import type { Notification } from "./notice.types";
import { toMdHm } from "./format";
import { buildNoticeCopy } from "./copy";

export default function NoticeCard({
  n,
  deleteMode,
}: {
  n: Notification;
  deleteMode: boolean;
}) {
  const { snippet, suffix } = buildNoticeCopy(n);
  const detail = n.detail ?? "";
  const time = toMdHm(n.createdAt);
  const path = n.context?.path;
  const clickable = !deleteMode; // 삭제모드 아닐 때만 인터랙션
  const isQuoted = n.type !== "system"; // comment/reply만 따옴표

  // 툴팁 원문
  const rawForTitle =
    n.type === "comment"
      ? n.context?.title
      : n.type === "reply"
        ? n.context?.myComment
        : (n.text ?? "");

  return (
    <article
      role={clickable ? (path ? "link" : "button") : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={[
        "relative rounded-xl border p-3 md:p-4 transition-colors",
        n.read
          ? "bg-base-300 border-base-300 text-neutral-content"
          : "bg-base-200 border-base-300",
        clickable ? "cursor-pointer hover:bg-base-100/40" : "cursor-default",
      ].join(" ")}
      // TODO: UI만 작업함, 실제 이동/읽음 로직은 후속 이슈에서 연결
      onClick={undefined}
      title={rawForTitle || undefined}
    >
      {/* 삭제모드: 우상단 X */}
      {deleteMode && (
        <button
          type="button"
          aria-label="알림 삭제"
          className="absolute right-2 top-2 w-6 h-6 rounded-full flex items-center justify-center opacity-90 hover:opacity-100"
        >
          <span className="text-base text-primary-content leading-none">×</span>
        </button>
      )}

      {/* 안읽음 배지: 우상단(삭제모드 아닐 때만) */}
      {!n.read && !deleteMode && (
        <i
          aria-hidden
          className="absolute right-3 top-3 inline-block w-2 h-2 rounded-full bg-error"
        />
      )}

      {/* 내용 영역 */}
      <div className="flex items-start gap-2 pr-8">
        <div className="min-w-0 w-full">
          {/* 1) 첫째 줄: “ + snippet(길어지면 … 처리) + ” + suffix(항상 보임) */}
          <div className="flex items-baseline whitespace-nowrap overflow-hidden text-xs md:text-sm text-neutral-content">
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
            <time className="text-xs text-neutral-content">{time}</time>
          </div>
        </div>
      </div>
    </article>
  );
}
