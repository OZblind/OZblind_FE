// src/hooks/useGithubRepos.mock.tsx
import { useMemo } from "react";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import AssignedTagList from "@components/tags/AssignedTagList";
import type { GithubListItem } from "@components/Board/github/GithubList";
import { profileToTagsMock } from "@src/mocks/tags.mock";

/** 페이징 상수 */
const PAGE_SIZE = 10;
const MAX_PAGES = 4; // 0..3
export const GITHUB_REPOS_MOCK_KEY = ["github-repos-mock"] as const;

/** TagBadge용 라벨 타입 (렌더는 이 파일에서 처리) */
export type CohortLabel = "9기" | "10기" | "11기" | "12기";
export type PositionLabel = "프론트" | "백엔드";

/** 리스트의 ‘원천 데이터’(렌더 전) */
export type GithubPostBase = {
  id: string;
  title: string;
  excerpt: string;
  repoLink: string;
  cohort: CohortLabel;
  position: PositionLabel;
};

/** 페이지 타입 */
export type GithubPostsPage = {
  items: GithubPostBase[];
  hasMore: boolean;
};

/** 아이템 생성기 */
function makeItem(i: number): GithubPostBase {
  const k = i + 1;
  const cohortPool: CohortLabel[] = ["9기", "10기", "11기", "12기"];
  const posPool: PositionLabel[] = ["프론트", "백엔드"];

  const owner = i % 2 ? "vercel" : "facebook";
  const repo =
    i % 4 === 0
      ? "react"
      : i % 4 === 1
        ? "next.js"
        : i % 4 === 2
          ? "react"
          : "next.js";

  return {
    id: `post-${k}`,
    title: `오즈의 여섯 가지 그림자 #${k}`,
    excerpt: "오즈 코딩 스쿨 학생들만 참여 가능한 익명 커뮤니티",
    repoLink: `https://github.com/${owner}/${repo}`,
    cohort: cohortPool[i % cohortPool.length],
    position: posPool[i % posPool.length],
  };
}

/** 페이지 생성 */
function makePage(page: number): GithubPostsPage {
  const start = page * PAGE_SIZE;
  const items = Array.from({ length: PAGE_SIZE }, (_, idx) =>
    makeItem(start + idx)
  );
  return { items, hasMore: page < MAX_PAGES - 1 };
}

/** 무한 스크롤 목 훅 (원천 페이지 데이터 반환) */
export function useGithubReposMock() {
  return useInfiniteQuery({
    queryKey: GITHUB_REPOS_MOCK_KEY,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      await new Promise((r) => setTimeout(r, 400)); // 로딩 감
      return makePage(pageParam as number);
    },
    getNextPageParam: (lastPage, _pages, lastParam) =>
      lastPage.hasMore ? (lastParam as number) + 1 : undefined,
  });
}

/** 페이지 평탄화 + TagBadge ‘사용법’ 준수 렌더까지 한 번에 → GithubListItem[] */
export function useGithubMockListItems(
  data?: InfiniteData<GithubPostsPage>
): GithubListItem[] {
  return useMemo(() => {
    const bases = data?.pages.flatMap((p) => p.items) ?? [];
    return bases.map<GithubListItem>((r) => {
      const tagLabels = profileToTagsMock(r.cohort, r.position);
      const tagSlot = <AssignedTagList tags={tagLabels} />;

      return {
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        repoLink: r.repoLink,
        tagSlot,
      };
    });
  }, [data]);
}
