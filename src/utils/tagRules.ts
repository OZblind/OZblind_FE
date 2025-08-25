import type { PositionValue, Tag, TagClass } from "@src/types/tag";

/** 정확히 기수, 포지션 1개씩인지 검증 */
export function validateAssignedTags(tags: Tag[]) {
  const cohort = tags.filter((t) => t.category === "cohort");
  const position = tags.filter((t) => t.category === "position");

  return {
    ok: cohort.length === 1 && position.length === 1,
    cohortCount: cohort.length,
    positionCount: position.length,
  };
}

const COHORT_ID = (cohort: string) => `cohort-${cohort.replace("기", "")}`;
const POSITION_ID = (position: string) => `position-${position}`; // 필요시 스네이크/케밥 처리

export function mapUserToTags(cohort: string, position: string): Tag[] {
  return [
    { id: COHORT_ID(cohort), label: cohort, category: "cohort" },
    {
      id: POSITION_ID(position),
      label: position,
      category: "position",
    },
  ];
}

// UI 포지션 → 서버 class
export function posToTagClass(pos?: PositionValue): TagClass | undefined {
  if (pos === "front") return "FE";
  if (pos === "back") return "BE";
  return undefined;
}

// 서버 RawUserTag → 라벨 문자열 변환 보조
export const TAG_LABELS: Record<TagClass, string> = {
  FE: "프론트",
  BE: "백엔드",
};
