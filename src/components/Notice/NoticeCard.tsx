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
  const copy = buildNoticeCopy(n);
  const detail = n.detail ?? "";
  const time = toMdHm(n.createdAt);

  return (
    <article
      className={[
        "relative rounded-xl border p-3 md:p-4 transition-colors",
        n.read
          ? "bg-base-300 border-base-300 text-neutral-content"
          : "bg-base-200 border-base-300",
      ].join(" ")}
    >
      {/* 삭제모드일 때 X 버튼(우상단) */}
      {deleteMode && (
        <button
          type="button"
          aria-label="알림 삭제"
          className="absolute right-3 top-3 w-6 h-6 rounded-full flex items-center justify-center opacity-90 hover:opacity-100"
        >
          <span className="text-base leading-none">×</span>
        </button>
      )}

      {/* 안읽음 배지: 우상단 (삭제모드 아니면 노출) */}
      {!n.read && !deleteMode && (
        <i
          aria-hidden
          className="absolute right-3 top-3 inline-block w-2 h-2 rounded-full bg-error"
        />
      )}

      <div className="flex items-start gap-2 pr-8">
        <div className="min-w-0 w-full">
          {/* 1줄: 타입별 카피 */}
          <p className="text-sm md:text-base leading-snug truncate">{copy}</p>
          {/* 2줄: 실제 내용 */}
          {detail && (
            <p className="mt-1 text-sm md:text-base truncate">{detail}</p>
          )}
          {/* 3줄: 시간(우측 정렬) */}
          <div className="mt-1 flex justify-end">
            <time className="text-xs opacity-70">{time}</time>
          </div>
        </div>
      </div>
    </article>
  );
}
