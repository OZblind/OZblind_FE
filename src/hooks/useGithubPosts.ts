import React from "react";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GithubListItem } from "@components/Board/github/GithubList";
import type { PostListItem } from "@api/posts";
import { fetchGithubLinkById, fetchGithubListPage } from "@api/github";
import { mapToGithubListItem } from "@src/features/posts/list/githubAdapter";
import AssignedTagList from "@components/tags/AssignedTagList";
import { adaptUserTag } from "@src/features/tags/adapters";
import type { RawUserTag } from "@api/tags";
import { LIST_SETTINGS } from "@src/constants/ui";
import type { AxiosError } from "axios";

// NOTE: 키 표시에만 사용 (API 파라미터는 github.ts에서 board id 사용)
const GITHUB_BOARD_SLUG = "github" as const;

// ---------------------------
// TODO(sort): UI의 SortValue ↔ API ordering 매핑 표
export type SortValue = "latest" | "oldest" | "mostViewed" | "leastViewed";
function toOrdering(
  v: SortValue | undefined
): "-created_at" | "created_at" | "-view_count" | "view_count" | undefined {
  switch (v) {
    case "latest":
      return "-created_at";
    case "oldest":
      return "created_at";
    case "mostViewed":
      return "-view_count";
    case "leastViewed":
      return "view_count";
    default:
      return undefined;
  }
}
// ---------------------------

export type UseGithubPostsOptions = {
  pageSize?: number; // default LIST_SETTINGS.ITEMS_PER_PAGE
  sort?: SortValue; // default 'latest'
  search?: string;
  tagIds?: number[];
};

type GithubPostsPage = { items: PostListItem[]; hasNext: boolean };

async function fetchGithubPage(
  page: number,
  opt?: UseGithubPostsOptions
): Promise<GithubPostsPage> {
  return fetchGithubListPage({
    page,
    page_size: opt?.pageSize ?? LIST_SETTINGS.ITEMS_PER_PAGE,
    ordering: toOrdering(opt?.sort) ?? "-created_at",
    // search: opt?.search,
    // tags: opt?.tagIds,
  });
}

export function useGithubPosts(opt?: UseGithubPostsOptions) {
  const pageSize = opt?.pageSize ?? LIST_SETTINGS.ITEMS_PER_PAGE;
  const ordering = toOrdering(opt?.sort) ?? "-created_at";

  return useInfiniteQuery<GithubPostsPage, unknown>({
    // 옵션 포함해서 캐시 분리
    queryKey: [
      "github-posts",
      {
        board: GITHUB_BOARD_SLUG,
        pageSize,
        ordering,
        search: opt?.search ?? "",
        tags: opt?.tagIds ?? [],
      },
    ] as const,

    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchGithubPage(pageParam as number, opt),

    // 서버 hasNext 신뢰 + 방어적으로 길이 체크(배수 케이스 안전)
    getNextPageParam: (lastPage, pages, lastParam) => {
      if (!lastPage?.hasNext) return undefined;
      if (!Array.isArray(lastPage.items) || lastPage.items.length < pageSize) {
        return undefined;
      }

      // 중복 페이지 방지(같은 id 시퀀스가 연달아 오면 종료)
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

    // 404는 "끝" 신호로 간주 → 재시도/에러 전환 방지
    retry: (failureCount, err) => {
      const ae = err as AxiosError | undefined;
      if (ae?.response?.status === 404) return false;
      return failureCount < 2;
    },

    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    // 필요 시:
    // refetchOnWindowFocus: false,
  });
}

/**
 * 리스트 아이템 변환 단계에서 tagSlot을 주입
 */
export function useGithubListItems(data?: InfiniteData<GithubPostsPage>) {
  const flat: PostListItem[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const isRawUserTag = (u: unknown): u is RawUserTag =>
    typeof u === "object" &&
    u !== null &&
    typeof (u as { id?: unknown }).id === "number" &&
    (u as { tag_class?: unknown }).tag_class !== undefined &&
    typeof (u as { tag_number?: unknown }).tag_number === "number";

  return useMemo<GithubListItem[]>(
    () =>
      flat.map((it) => {
        const base = mapToGithubListItem(it);
        const maybeUser = (it as unknown as { user?: unknown }).user;
        const tags = adaptUserTag(isRawUserTag(maybeUser) ? maybeUser : null);
        const tagSlot =
          tags.length > 0
            ? React.createElement(AssignedTagList, { tags })
            : undefined;

        return {
          ...base,
          tagSlot,
        };
      }),
    [flat]
  );
}

/** repoLink 프리패치 + 보강 + 중복 방지 + 클릭 핸들러 제공 */
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
        // TODO(UX): 토스트 "레포 링크를 가져올 수 없습니다."
      }
    },
    [linkMap]
  );

  return { items, onRepoClick };
}
