import { useEffect } from "react";
import NoticeHeader from "./NoticeHeader";
import NoticeList from "./NoticeList";
import { useNoticeDeleteMode } from "./useNoticeDeleteMode";
import {
  useNewFlagValue,
  useNotificationList,
} from "@src/hooks/useNotifications";
import { useAuthStore } from "@store/authStore";

type Props = { open: boolean; onClose?: () => void };

export default function NotificationModal({ open, onClose }: Props) {
  // 인증 여부
  const accessToken = useAuthStore((s) => s.tokens.accessToken);
  const isOzAuthenticated = useAuthStore((s) => s.isOzAuthenticated);
  const enabled = open && (!!accessToken || !!isOzAuthenticated);

  const { refetch, markAllRead, deleteAll } = useNotificationList({ enabled });

  // 전역 체크 캐시 구독 → 모달 열린 상태에서 new:true면 즉시 갱신
  const hasNew = useNewFlagValue();

  // 삭제모드 토글/리셋
  const { deleteMode, toggleDeleteMode, resetDeleteMode } =
    useNoticeDeleteMode();

  const handleClose = () => {
    onClose?.();
    resetDeleteMode(); // 모달 닫힐 때 삭제모드 초기화
  };

  // 1) 열릴 때마다 강제 최신화 (staleTime 무시)
  useEffect(() => {
    if (enabled) refetch();
  }, [enabled, refetch]);

  // 2) 모달 열린 상태에서 새 알림 감지되면 즉시 최신화
  useEffect(() => {
    if (open && hasNew) refetch();
  }, [open, hasNew, refetch]);

  // 3) ESC 닫기 + 바디 스크롤 잠금
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

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
          bg-base-200 md:rounded-2xl md:overflow-hidden shadow-2xl
          flex flex-col min-h-0
        "
      >
        <NoticeHeader
          deleteMode={deleteMode}
          onToggleDeleteMode={toggleDeleteMode}
          onRequestClose={handleClose}
          onMarkAllRead={() => markAllRead.mutate()}
          onDeleteAll={() => deleteAll.mutate()}
        />
        <div className="flex-1 min-h-0 overflow-y-auto p-2 md:p-3">
          {/* 모달 열렸고 인증일 때만 목록 쿼리 활성화 */}
          <NoticeList
            deleteMode={deleteMode}
            enabled={enabled}
            onItemNavigate={handleClose}
          />
        </div>
      </section>
    </div>
  );
}
