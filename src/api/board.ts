import api from "@api/client";

/** Board 타입은 백엔드 스키마에 맞춰 조정하세요 */
export type Board = {
  id: number;
  name: string; // "자유"
  slug?: string; // "free" (있다면)
  description?: string;
};

export async function fetchBoards(): Promise<Board[]> {
  // 절대 경로 + 끝 슬래시
  const { data } = await api.get<Board[]>("api/boards");
  return data;
}

/** slug → id 매핑(서버가 slug 지원 안하면 프론트에서 매핑 관리) */
export async function getBoardIdBySlug(slug: string): Promise<number | null> {
  const boards = await fetchBoards();
  // slug 필드가 없으면 name/기타 규칙으로 매핑
  const match =
    boards.find((b) => b.slug === slug) ??
    boards.find((b) => b.name === slug) ??
    null;
  return match?.id ?? null;
}
