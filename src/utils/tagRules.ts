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
