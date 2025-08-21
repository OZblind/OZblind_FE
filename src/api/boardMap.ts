import { type BoardSlug } from "@constants/boards";
import { fetchBoards } from "./board";
import { BOARD_NAME_BY_SLUG } from "@src/constants/board";

let cache: { byName: Map<string, number> } | null = null;

export async function getBoardIdBySlug(slug: BoardSlug) {
  if (!cache) {
    const list = await fetchBoards();
    cache = { byName: new Map(list.map((b) => [b.name, b.id])) };
  }
  const targetName = BOARD_NAME_BY_SLUG[slug];
  const id = cache.byName.get(targetName);
  if (!id) {
    throw new Error(
      `'${targetName}' 보드를 찾을 수 없습니다. (DB에 존재하는지 확인)`
    );
  }
  return id;
}
