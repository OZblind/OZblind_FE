import { useState } from "react";

/** 알림 패널 내 '삭제 모드' 전용 UI 상태 훅 */
export function useNoticeDeleteMode() {
  const [deleteMode, setDeleteMode] = useState(false);
  const toggleDeleteMode = () => setDeleteMode((v) => !v);
  const resetDeleteMode = () => setDeleteMode(false);
  return { deleteMode, toggleDeleteMode, resetDeleteMode };
}
