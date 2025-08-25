import NoticeCard from "./NoticeCard";
import { useNotificationList } from "@src/hooks/useNotifications";

export default function NoticeList({
  deleteMode,
  enabled = true,
}: {
  deleteMode: boolean;
  enabled?: boolean;
}) {
  const { items, isLoading, isError, markOne, deleteOne, refetch } =
    useNotificationList({ enabled });

  // 비활성화 상태면 렌더 안 함
  if (!enabled) return null;

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-content">
        불러오는 중…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="py-20 text-center text-sm text-error flex flex-col items-center gap-2">
        알림을 불러오지 못했어요.
        <button className="btn btn-xs" onClick={() => refetch()}>
          다시 시도
        </button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="py-20 text-center text-sm text-neutral-content">
        새 알림이 없습니다.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((n) => (
        <li key={n.id}>
          <NoticeCard
            n={n}
            deleteMode={deleteMode}
            onDelete={() => deleteOne.mutate(Number(n.id))}
            onMarkRead={() => markOne.mutate(Number(n.id))}
          />
        </li>
      ))}
    </ul>
  );
}
