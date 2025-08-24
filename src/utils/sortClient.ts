import type { SortValue } from "@src/types/sort";

export function sortClientSide<T>(
  items: T[],
  sort: SortValue,
  keyMap: {
    createdAt: (it: T) => number;
    viewCount?: (it: T) => number;
  }
) {
  const arr = [...items];
  arr.sort((a, b) => {
    switch (sort) {
      case "latest":
        return keyMap.createdAt(b) - keyMap.createdAt(a);
      case "oldest":
        return keyMap.createdAt(a) - keyMap.createdAt(b);
      case "mostViewed":
        return (keyMap.viewCount?.(b) ?? 0) - (keyMap.viewCount?.(a) ?? 0);
      case "leastViewed":
        return (keyMap.viewCount?.(a) ?? 0) - (keyMap.viewCount?.(b) ?? 0);
      default:
        return 0;
    }
  });
  return arr;
}
