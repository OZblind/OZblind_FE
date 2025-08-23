import React from "react";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GithubListItem } from "@components/Board/github/GithubList";
import type { PostListItem } from "@api/posts";
import { fetchGithubLinkById, fetchGithubListPage } from "@api/github";
import { mapToGithubListItem } from "@src/features/posts/list/githubAdapter";
import AssignedTagList from "@components/tags/AssignedTagList";
import { adaptUserTag } from "@src/features/tags/adapters";
import type { RawUserTag } from "@src/types/tag";

// NOTE: 키 표시에만 사용 (API 파라미터는 github.ts에서 board id 사용)
const GITHUB_BOARD_SLUG = "github" as const;

// ---------------------------
// TODO(sort): UI의 SortValue ↔ API ordering 매핑 표
// useBoardPosts와 동일한 규약 유지
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

// 훅 옵션(현재는 전부 optional, 미지정 시 현행 동작 유지)
// TODO(filter): 태그/검색/정렬 연결 시 PostListPage, useBoardPosts와 동일 시그니처로 확장
export type UseGithubPostsOptions = {
  pageSize?: number; // default 10
  sort?: SortValue; // default 'latest'
  search?: string; // 검색어
  tagIds?: number[]; // TODO(tags): 서버 태그 필터 파라미터 키 확인 후 적용
};

const DEFAULT_PAGE_SIZE = 10;

type GithubPostsPage = { items: PostListItem[]; hasNext: boolean };

async function fetchGithubPage(
  page: number,
  opt?: UseGithubPostsOptions
): Promise<GithubPostsPage> {
  return fetchGithubListPage({
    page,
    page_size: opt?.pageSize ?? DEFAULT_PAGE_SIZE,
    ordering: toOrdering(opt?.sort) ?? "-created_at",
    // TODO(filter): search/tagIds 전달 (백엔드 파라미터 키 확정되면 아래 주석 해제)
    // search: opt?.search,
    // tags: opt?.tagIds,
  });
}

export function useGithubPosts(opt?: UseGithubPostsOptions) {
  const pageSize = opt?.pageSize ?? DEFAULT_PAGE_SIZE;
  const ordering = toOrdering(opt?.sort) ?? "-created_at";

  return useInfiniteQuery({
    // 키에 옵션 포함 (정렬/필터 변경 시 캐시 분리)
    queryKey: [
      "github-posts",
      {
        board: GITHUB_BOARD_SLUG,
        pageSize,
        ordering,
        search: opt?.search,
        tags: opt?.tagIds,
      },
    ] as const,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchGithubPage(pageParam as number, opt),
    getNextPageParam: (lastPage, pages, lastParam) => {
      if (!lastPage.hasNext) return undefined;

      const prev = pages[pages.length - 2] as GithubPostsPage | undefined;
      if (prev) {
        const a = prev.items.map((p) => p.id);
        const b = lastPage.items.map((p) => p.id);
        if (a.length === b.length && a.every((v, i) => v === b[i]))
          return undefined;
      }
      return (lastParam as number) + 1;
    },
    // 개발 중엔 필요 시 주석 해제
    // retry: false,
    // refetchOnWindowFocus: false,
  });
}

/**
 * 리스트 아이템 변환 단계에서 tagSlot을 주입
 * - PostListItem에 user(오즈키 태그 원본)가 포함되어 있다면 AssignedTagList를 생성해 tagSlot에 넣음
 * - 포함되지 않았다면 tagSlot은 생략(상세에서만 태그 노출)
 */
export function useGithubListItems(data?: InfiniteData<GithubPostsPage>) {
  const flat: PostListItem[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  type WithUser =
    | {
        user?: {
          id: number;
          tag_class: "FE" | "BE";
          tag_number: number;
        } | null;
      }
    | Record<string, unknown>;

  return useMemo<GithubListItem[]>(
    () =>
      flat.map((it) => {
        const base = mapToGithubListItem(it);
        const rawUser = (it as WithUser).user as RawUserTag | null | undefined;
        const tags = adaptUserTag(rawUser);
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
    // TODO(perf): IntersectionObserver로 "화면에 들어온 카드"만 프리패치(성능 이슈 시)
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
