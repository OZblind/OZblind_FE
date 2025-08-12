import { MOCK_NOTICES } from "./notice.mock";
import NoticeCard from "./NoticeCard";

export default function NoticeList({ deleteMode }: { deleteMode: boolean }) {
  const items = MOCK_NOTICES; // ❗️ 정적 데이터(더미) -> 추후 교체

  if (!items.length) {
    return (
      <div className="py-20 text-center text-sm text-neutral-content">
        새 알림이 없습니다
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((n) => (
        <li key={n.id}>
          <NoticeCard n={n} deleteMode={deleteMode} />
        </li>
      ))}
    </ul>
  );
}
