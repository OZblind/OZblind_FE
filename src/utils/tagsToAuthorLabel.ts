import type { Tag } from "@src/types/tag";

/** Tag[]에서 "포지션 + 기수" 라벨을 만든다. 예: "프론트엔드 11기" */
export function tagsToAuthorLabel(tags: Tag[] | undefined | null): string {
  if (!tags?.length) return "";
  const cohort = tags.find((t) => t.category === "cohort")?.label; // "11기"
  const posRaw = tags.find((t) => t.category === "position")?.label; // "프론트" | "백엔드" ...
  const position = posRaw === "프론트" ? "프론트엔드" : (posRaw ?? "");
  return [position, cohort].filter(Boolean).join(" ");
}
