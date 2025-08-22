import { COHORT_TAG_COLORS, POSITION_TAG_COLORS } from "@constants/tagColors";
import type { Tag } from "@src/types/tag";

function colorClass(tag: Tag): string {
  if (tag.category === "cohort")
    return COHORT_TAG_COLORS[tag.label] ?? "bg-gray-400 text-white";
  return POSITION_TAG_COLORS[tag.label] ?? "bg-gray-500 text-white";
}

export default function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        colorClass(tag),
      ].join(" ")}
      aria-label={`${tag.category}: ${tag.label}`}
      title="회원가입 키로 자동 부여된 태그"
    >
      {tag.label}
    </span>
  );
}
