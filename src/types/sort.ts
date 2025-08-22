export type SortValue = "latest" | "oldest" | "mostViewed" | "leastViewed";

export const SORT_LABELS: Record<SortValue, string> = {
  latest: "최신순",
  oldest: "오래된순",
  mostViewed: "조회 많은순",
  leastViewed: "조회 적은순",
};

export const SORT_OPTIONS: { value: SortValue; label: string }[] = (
  ["latest", "oldest", "mostViewed", "leastViewed"] as const
).map((v) => ({ value: v, label: SORT_LABELS[v] }));
