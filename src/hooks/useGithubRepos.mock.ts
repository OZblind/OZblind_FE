import { useInfiniteQuery } from "@tanstack/react-query";
import type { GithubListItem } from "@components/Board/github/GithubList";

const PAGE_SIZE = 10;
const MOCK_KEY = ["github-repos-mock"] as const;

function makeItem(i: number): GithubListItem {
  return {
    id: `repo-${i}`,
    thumbnail:
      i % 4 === 0
        ? "" // 썸네일 실패 케이스 테스트
        : `https://picsum.photos/seed/repo-${i}/160/160`,
    repoName: `flyingturtles/flight #${i + 1}`,
    ownerTag: i % 2 ? "Front" : "Full",
    desc: "오즈 코딩 스쿨 학생들만 참여 가능한 익명 커뮤니티",
    href: "https://ashduasda.sdjh",
  };
}

function makePage(page: number): { items: GithubListItem[]; hasMore: boolean } {
  const start = page * PAGE_SIZE;
  const count = PAGE_SIZE;
  const items = Array.from({ length: count }, (_, k) => makeItem(start + k));
  const hasMore = page < 3; // 0,1,2,3 → 마지막 페이지
  return { items, hasMore };
}

export function useGithubReposMock() {
  return useInfiniteQuery({
    queryKey: MOCK_KEY,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      await new Promise((r) => setTimeout(r, 500)); // 로딩 감
      return makePage(pageParam as number);
    },
    getNextPageParam: (lastPage, _pages, lastParam) =>
      lastPage.hasMore ? (lastParam as number) + 1 : undefined,
  });
}
