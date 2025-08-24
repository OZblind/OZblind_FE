import NoticeCard from "./NoticeCard";
import { useNotificationList } from "@src/hooks/useNotifications";

export default function NoticeList({ deleteMode }: { deleteMode: boolean }) {
  const { items, isLoading, isError, markOne, deleteOne } =
    useNotificationList();

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-content">
        불러오는 중…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="py-20 text-center text-sm text-error">
        알림을 불러오지 못했어요.
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
