import { useEffect } from "react";
import NoticeHeader from "./NoticeHeader";
import NoticeList from "./NoticeList";
import { useNoticeDeleteMode } from "./useNoticeDeleteMode";
import { useNotificationList } from "@src/hooks/useNotifications";

type Props = { open: boolean; onClose?: () => void };

export default function NotificationModal({ open, onClose }: Props) {
  const { deleteMode, toggleDeleteMode, resetDeleteMode } =
    useNoticeDeleteMode();
  const { markAllRead, deleteAll, refetch } = useNotificationList();

  const handleClose = () => {
    onClose?.();
    resetDeleteMode(); // 모달 닫힐 때 삭제모드 초기화
  };

  useEffect(() => {
    if (!open) return;
    refetch();

    // ESC 닫기 + 바디 스크롤 잠금
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", h);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, refetch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000]">
      {/* 오버레이(바깥 클릭 시 닫기) */}
      <button
        aria-label="모달 닫기"
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 cursor-default"
      />
      {/* 패널 */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-title"
        className="
          absolute left-1/2 -translate-x-1/2 top-0 md:top-20
          w-full md:w-[560px]
          h-dvh md:h-auto md:max-h-[80vh]
          bg-base-200 md:rounded-2xl shadow-2xl
          flex flex-col
        "
      >
        <NoticeHeader
          deleteMode={deleteMode}
          onToggleDeleteMode={toggleDeleteMode}
          onRequestClose={handleClose}
          onMarkAllRead={() => markAllRead.mutate()}
          onDeleteAll={() => deleteAll.mutate()}
        />
        <div className="flex-1 overflow-y-auto p-2 md:p-3">
          <NoticeList deleteMode={deleteMode} />
        </div>
      </section>
    </div>
  );
}
