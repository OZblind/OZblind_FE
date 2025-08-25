import api from "@api/client";
import { tokenStore } from "@api/client";
import { useAuthStore } from "@store/authStore";

/** 서버 원본 타입 */
export type ApiNotification = {
  id: number;
  post?: { id: number; title: string } | null;
  message: string;
  is_read: boolean;
  created_at: string; // ISO
};

/** 풀 인증(액세스 토큰 + 오즈 인증 완료) 확인 */
function isFullyAuthed(): boolean {
  const hasAccess = Boolean(tokenStore.access);
  const ozOk = useAuthStore.getState().isOzAuthenticated === true;
  return hasAccess && ozOk;
}

/** 목록: GET /api/ntf/ */
export async function fetchNotifications(): Promise<ApiNotification[]> {
  if (!isFullyAuthed()) throw new Error("로그인/인증 후 이용 가능합니다.");
  const { data } = await api.get<ApiNotification[]>("/api/ntf/");
  return data;
}

/** 전체 읽음: PATCH /api/ntf/ */
export async function markAllRead(): Promise<void> {
  if (!isFullyAuthed()) throw new Error("로그인/인증 후 이용 가능합니다.");
  await api.patch("/api/ntf/", {}); // 바디 필요 없으므로 빈 객체
}

/** 전체 삭제: DELETE /api/ntf/ */
export async function deleteAllNotifications(): Promise<void> {
  if (!isFullyAuthed()) throw new Error("로그인/인증 후 이용 가능합니다.");
  await api.delete("/api/ntf/");
}

/** 개별 읽음: PATCH /api/ntf/{id}/ */
export async function markOneRead(id: number): Promise<void> {
  if (!isFullyAuthed()) throw new Error("로그인/인증 후 이용 가능합니다.");
  await api.patch(`/api/ntf/${id}/`, {}); // DRF trailing slash & 빈 바디
}

/** 개별 삭제: DELETE /api/ntf/{id}/ */
export async function deleteOne(id: number): Promise<void> {
  if (!isFullyAuthed()) throw new Error("로그인/인증 후 이용 가능합니다.");
  await api.delete(`/api/ntf/${id}/`);
}

/** 새 알림 여부: GET /api/ntf/check/ -> { new: boolean }
 *  로그인+미인증 단계에서는 조용히 { new:false } 반환 (UX 위해 에러 미노출)
 */
export async function checkNew(): Promise<{ new: boolean }> {
  if (!isFullyAuthed()) return { new: false };
  const { data } = await api.get<{ new: boolean }>("/api/ntf/check/");
  return data;
}
