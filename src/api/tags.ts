import type { Tag } from "@src/types/tag";

type ServerTag = {
  id: string;
  label: string;
  category: "cohort" | "position";
  color?: string;
};

export async function fetchAssignedTagsByKey(key: string): Promise<Tag[]> {
  const res = await fetch(`/api/tags/by-key?key=${encodeURIComponent(key)}`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to fetch tags (${res.status})`);
  const data = (await res.json()) as { tags: ServerTag[] };

  // 서버에서 반드시 태그 2개를 내려준다는 계약 가정한 것
  return data.tags.slice(0, 2).map((t) => ({ ...t, locked: true }));
}
