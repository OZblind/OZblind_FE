import { COHORT_TAG_COLORS, POSITION_TAG_COLORS } from "@constants/tagColors";
import type { Tag } from "@src/types/tag";

function getTagClasses(tag: Tag) {
  if (tag.category === "cohort") {
    return COHORT_TAG_COLORS[tag.label] ?? "bg-gray-400 text-white";
  }
  if (tag.category === "position") {
    return POSITION_TAG_COLORS[tag.label] ?? "bg-gray-500 text-white";
  }
  return "bg-gray-400 text-white";
}

export default function TagBadge({ tag }: { tag: Tag }) {
  const colorClass = getTagClasses(tag);

  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        colorClass,
      ].join(" ")}
      aria-label={`${tag.category}: ${tag.label}`}
    >
      {tag.label}
      {tag.locked && (
        <span className="ml-1 bg-black/30 px-1 rounded text-[10px]">LOCK</span>
      )}
    </span>
  );
}
