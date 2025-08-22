export type SortValue = "latest" | "vote" | "views" | "comments";

export const SORT_LABELS: Record<SortValue, string> = {
  latest: "최신순",
  vote: "추천순",
  views: "조회순",
  comments: "댓글순",
};

export const SORT_OPTIONS: { value: SortValue; label: string }[] = (
  ["latest", "vote", "views", "comments"] as const
).map((v) => ({ value: v, label: SORT_LABELS[v] }));
