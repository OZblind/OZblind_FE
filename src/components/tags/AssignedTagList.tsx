import type { Tag } from "@src/types/tag";
import TagBadge from "./TagBadge";

export default function AssignedTagList({
  tags,
  className,
}: {
  tags: Tag[];
  className?: string;
}) {
  if (!tags?.length) return null;
  const ordered = [...tags].sort((a, b) =>
    a.category === b.category ? 0 : a.category === "cohort" ? -1 : 1
  );
  return (
    <div className={["flex flex-wrap gap-2", className ?? ""].join(" ")}>
      {ordered.map((t) => (
        <TagBadge key={t.id} tag={t} />
      ))}
    </div>
  );
}
