import api from "@api/client";

/** 서버 원본 타입 */
export type ApiNotification = {
  id: number;
  post?: { id: number; title: string } | null;
  message: string;
  is_read: boolean;
  created_at: string; // ISO
};

/** 목록: GET /api/ntf/ */
export async function fetchNotifications(): Promise<ApiNotification[]> {
  const { data } = await api.get<ApiNotification[]>("/api/ntf/");
  return data;
}

/** 전체 읽음: PATCH /api/ntf/ */
export async function markAllRead(): Promise<void> {
  await api.patch("/api/ntf/", {}); // 바디 필요 없으므로 빈 객체
}

/** 전체 삭제: DELETE /api/ntf/ */
export async function deleteAllNotifications(): Promise<void> {
  await api.delete("/api/ntf/");
}

/** 개별 읽음: PATCH /api/ntf/{id} */
export async function markOneRead(id: number): Promise<void> {
  await api.patch(`/api/ntf/${id}`);
}

/** 개별 삭제: DELETE /api/ntf/{id} */
export async function deleteOne(id: number): Promise<void> {
  await api.delete(`/api/ntf/${id}`);
}

/** 새 알림 여부: GET /api/ntf/check  -> { new: boolean } */
export async function checkNew(): Promise<{ new: boolean }> {
  const { data } = await api.get<{ new: boolean }>("/api/ntf/check");
  return data;
}
