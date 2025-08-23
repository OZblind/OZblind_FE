import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GithubListItem } from "@components/Board/github/GithubList";
import type { PostListItem } from "@api/posts";
import { fetchGithubLinkById, fetchGithubListPage } from "@api/github";
import { mapToGithubListItem } from "@src/features/posts/list/githubAdapter";
import { LIST_SETTINGS } from "@src/constants/ui";

const GITHUB_BOARD_SLUG = "github" as const; // 키에만 사용 (표시용)
const PAGE_SIZE = LIST_SETTINGS.ITEMS_PER_PAGE;

type GithubPostsPage = { items: PostListItem[]; hasNext: boolean };

async function fetchGithubPage(page: number): Promise<GithubPostsPage> {
  // 다음 페이지 존재 여부는 API 레이어가 판단
  return fetchGithubListPage({
    page,
    page_size: PAGE_SIZE,
    ordering: "-created_at",
  });
}

export const GITHUB_POSTS_KEY = [
  "github-posts",
  { board: GITHUB_BOARD_SLUG, pageSize: PAGE_SIZE, ordering: "-created_at" },
] as const;

export function useGithubPosts() {
  return useInfiniteQuery({
    queryKey: GITHUB_POSTS_KEY,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchGithubPage(pageParam as number),
    getNextPageParam: (lastPage, pages, lastParam) => {
      // ✅ API 레이어가 알려준 hasNext만 신뢰
      if (!lastPage.hasNext) return undefined;

      // 안전 가드: 서버가 같은 페이지를 반복으로 주는 경우 차단
      const prev = pages[pages.length - 2] as GithubPostsPage | undefined;
      if (prev) {
        const a = prev.items.map((p) => p.id);
        const b = lastPage.items.map((p) => p.id);
        if (a.length === b.length && a.every((v, i) => v === b[i])) {
          return undefined;
        }
      }
      return (lastParam as number) + 1;
    },
    // 개발 중이면 주석 해제
    // retry: false,
    // refetchOnWindowFocus: false,
  });
}

export function useGithubListItems(data?: InfiniteData<GithubPostsPage>) {
  const flat: PostListItem[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );
  return useMemo<GithubListItem[]>(
    () => flat.map((it) => mapToGithubListItem(it)),
    [flat]
  );
}

/** 🔗 repoLink 프리패치(변경 없음) */
export function useGithubListWithLinks(data?: InfiniteData<GithubPostsPage>): {
  items: GithubListItem[];
  onRepoClick: (id: string) => Promise<void>;
} {
  const raw = useGithubListItems(data);

  const [linkMap, setLinkMap] = useState<Record<string, string>>({});
  const mountedRef = useRef(true);
  const busySetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    return () => void (mountedRef.current = false);
  }, []);

  useEffect(() => {
    const targets = raw
      .filter(
        (it) =>
          !it.repoLink && !linkMap[it.id] && !busySetRef.current.has(it.id)
      )
      .map((it) => it.id);

    if (targets.length === 0) return;
    targets.forEach((id) => busySetRef.current.add(id));

    (async () => {
      try {
        const results = await Promise.all(
          targets.map(async (id) => {
            try {
              const link = await fetchGithubLinkById(id);
              return { id, link };
            } catch {
              return { id, link: "" as string };
            }
          })
        );
        if (!mountedRef.current) return;
        setLinkMap((prev) => {
          const next = { ...prev };
          for (const { id, link } of results) if (link) next[id] = link;
          return next;
        });
      } finally {
        targets.forEach((id) => busySetRef.current.delete(id));
      }
    })();
  }, [raw, linkMap]);

  const items = useMemo(
    () =>
      raw.map((it) => ({
        ...it,
        repoLink: it.repoLink || linkMap[it.id] || "",
      })),
    [raw, linkMap]
  );

  const onRepoClick = useCallback(
    async (id: string) => {
      const cached = linkMap[id];
      if (cached) {
        window.open(cached, "_blank", "noopener,noreferrer");
        return;
      }
      try {
        const link = await fetchGithubLinkById(id);
        if (!link) return;
        if (mountedRef.current) setLinkMap((prev) => ({ ...prev, [id]: link }));
        window.open(link, "_blank", "noopener,noreferrer");
      } catch {
        // TODO[UX]: 토스트
      }
    },
    [linkMap]
  );

  return { items, onRepoClick };
}
