// src/hooks/useGithubPosts.ts
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import type { GithubListItem } from "@components/Board/github/GithubList";
import { mapToGithubListItem } from "@src/features/posts/list/githubAdapter";
import AssignedTagList from "@components/tags/AssignedTagList";
import { adaptUserTag } from "@src/features/tags/adapters";
import type { RawUserTag } from "@api/tags";
import { LIST_SETTINGS } from "@src/constants/ui";
import type { AxiosError } from "axios";
import type { SortValue } from "@src/types/sort";
import { fetchPosts, type PostListItem } from "@api/posts";
import { fetchGithubLinkById } from "@api/github";
import type { TagFilter } from "@src/types/tag";

// NOTE: 키 표시에만 사용 (API 파라미터는 posts.ts에서 board slug → id 변환)
const GITHUB_BOARD_SLUG = "github" as const;

// UI SortValue → API ordering
const SORT_TO_ORDERING: Record<
  SortValue | "most_viewed" | "least_viewed",
  "-created_at" | "created_at" | "-view_count" | "view_count"
> = {
  latest: "-created_at",
  oldest: "created_at",
  mostViewed: "-view_count",
  leastViewed: "view_count",
  // snake_case 폴백
  most_viewed: "-view_count",
  least_viewed: "view_count",
};

export type UseGithubPostsOptions = {
  pageSize?: number; // default LIST_SETTINGS.ITEMS_PER_PAGE
  sort?: SortValue;
  search?: string;
  tagIds?: number[];
  tags?: TagFilter;
};

type GithubPostsPage = { items: PostListItem[]; hasNext: boolean };

// 페이지 단위 fetch (posts API 사용: 태그/정렬/검색 타입 안전)
async function fetchGithubPage(
  page: number,
  opt?: UseGithubPostsOptions
): Promise<GithubPostsPage> {
  type SortKey = keyof typeof SORT_TO_ORDERING;
  const sortKey: SortKey = (opt?.sort ?? "latest") as SortKey;
  const ordering = SORT_TO_ORDERING[sortKey] ?? "-created_at";
  const pageSize = opt?.pageSize ?? LIST_SETTINGS.ITEMS_PER_PAGE;

  const list = await fetchPosts({
    board: "github",
    page,
    page_size: pageSize,
    ordering,
    search: opt?.search,
    user_tag_class: opt?.tags?.tagClass,
    user_tag_number:
      typeof opt?.tags?.cohort === "number" ? opt!.tags!.cohort : undefined,
  });

  return {
    items: list,
    hasNext: list.length >= pageSize,
  };
}

export function useGithubPosts(opt?: UseGithubPostsOptions) {
  const pageSize = opt?.pageSize ?? LIST_SETTINGS.ITEMS_PER_PAGE;
  type SortKey = keyof typeof SORT_TO_ORDERING;
  const sortKey: SortKey = (opt?.sort ?? "latest") as SortKey;
  const ordering = SORT_TO_ORDERING[sortKey] ?? "-created_at";
  const search = opt?.search ?? "";
  const tagIds = opt?.tagIds ?? [];
  const tags = opt?.tags;

  return useInfiniteQuery<GithubPostsPage, unknown>({
    // 옵션 포함해서 캐시 분리
    queryKey: [
      "github-posts",
      {
        board: GITHUB_BOARD_SLUG,
        pageSize,
        ordering,
        search,
        tagIds,
        tags,
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
