import type { RawUserTag, Tag } from "@src/types/tag";

/** 서버 RawUserTag 타입가드 (안전한 분기용) */
export function isRawUserTag(u: unknown): u is RawUserTag {
  return (
    typeof u === "object" &&
    u !== null &&
    typeof (u as { id?: unknown }).id === "number" &&
    (u as { tag_class?: unknown }).tag_class !== undefined &&
    typeof (u as { tag_number?: unknown }).tag_number === "number"
  );
}

/** 서버의 user 태그 1개 → 프론트 Tag[] (cohort/position 2개로 분리) */
export function adaptUserTag(raw?: RawUserTag | null): Tag[] {
  if (!raw) return [];

  const tags: Tag[] = [];

  // cohort (기수)
  if (typeof raw.tag_number === "number") {
    tags.push({
      id: `${raw.id}-cohort`,
      category: "cohort",
      label: `${raw.tag_number}기`,
    });
  }

  // position (FE/BE)
  if (raw.tag_class === "FE" || raw.tag_class === "BE") {
    tags.push({
      id: `${raw.id}-pos`,
      category: "position",
      label: raw.tag_class === "FE" ? "프론트" : "백엔드",
    });
  }

  return tags;
}

/** 작성자 라벨(예: "11기 · 프론트") */
export function tagsToAuthorLabel(tags: Tag[]): string {
  const cohort = tags.find((t) => t.category === "cohort")?.label;
  const pos = tags.find((t) => t.category === "position")?.label;
  if (cohort && pos) return `${cohort} · ${pos}`;
  return cohort ?? pos ?? "";
}

/** RawUserTag 바로 → 작성자 라벨 */
export function rawUserTagToAuthorLabel(raw?: RawUserTag | null): string {
  return tagsToAuthorLabel(adaptUserTag(raw));
}
