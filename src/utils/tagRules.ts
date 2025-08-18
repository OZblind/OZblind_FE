import type { Tag } from "@src/types/tag";

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
    { id: COHORT_ID(cohort), label: cohort, category: "cohort", locked: true },
    {
      id: POSITION_ID(position),
      label: position,
      category: "position",
      locked: true,
    },
  ];
}
