import type { RawUserTag, Tag } from "@src/types/tag";

/** 서버의 1개 user 태그 객체 → 프론트용 Tag[] (cohort/position 2개로 분리) */
export function adaptUserTag(raw?: RawUserTag | null): Tag[] {
  if (!raw) return [];

  const tags: Tag[] = [];

  // cohort (기수)
  if (raw.tag_number != null) {
    tags.push({
      id: `${raw.id}-cohort`,
      category: "cohort",
      label: `${raw.tag_number}기`,
    });
  }

  // position (FE/BE)
  if (raw.tag_class) {
    const label = raw.tag_class === "FE" ? "프론트" : "백엔드";
    tags.push({
      id: `${raw.id}-pos`,
      category: "position",
      label,
    });
  }

  return tags;
}
