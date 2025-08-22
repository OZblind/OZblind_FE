import { useCallback, useMemo, useState } from "react";
import PostList from "@components/Board/free/PostList";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { urlForPost } from "@utils/urlForPost";
import { useNavigate } from "react-router-dom";
import { useBoardPosts } from "@src/mocks/useBoardPosts.mock";
import {
  profileToTagsMock,
  COHORTS,
  POSITIONS,
  type CohortLabel,
  type PositionLabel,
} from "@src/mocks/tags.mock";
import { tagsToAuthorLabel } from "@utils/tagsToAuthorLabel";

export default function InfoBoard() {
  const navigate = useNavigate();

  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    refetch,
  } = useBoardPosts("info", { sort: "latest", tags: [], q: "" });

  const items = useMemo<FreeBoardItem[]>(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  // 글쓴이 label 만들기
  const authorLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    const cohorts = COHORTS as readonly CohortLabel[];
    const positions = POSITIONS as readonly PositionLabel[];

    items.forEach((it, idx) => {
      // authorId가 있으면 그 숫자 기반으로, 없으면 idx 기반으로 생성
      const base = Number(/\d+/.exec(it.authorId ?? "")?.[0] ?? idx);
      const cohort = cohorts[(base + 1) % cohorts.length];
      const position = positions[base % positions.length];

      // 목 태그 → "프론트엔드 11기" 라벨로 변환
      const tags = profileToTagsMock(cohort, position);
      m.set(it.authorId ?? String(it.author), tagsToAuthorLabel(tags));
    });

    return m;
  }, [items]);

  const goDetail = useCallback(
    (id: FreeBoardItem["id"]) => navigate(urlForPost.postDetail("free", id)),
    [navigate]
  );

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "400px 0px",
    threshold: 0,
    disabled: isFetchingNextPage || !hasNextPage || isError,
    onIntersect: async () => {
      await fetchNextPage();
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    },
  });

  const handleRefresh = () => {
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    refetch();
  };

  const hasNoPages = !data || data.pages.length === 0;
  const isInitialLoading = hasNoPages && isFetching;
  const listIsLoading = isInitialLoading || isFetchingNextPage;

  const errorText =
    isError && error && typeof error === "object" && "message" in error
      ? (error as { message?: string }).message
      : undefined;

  return (
    <div className="w-full p-4 max-w-5xl mx-auto space-y-4">
      <section className="w-full rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-hidden">
        <PostList
          items={items}
          onItemClick={goDetail}
          topBar={{
            boardName: "정보 게시판",
            onOpenTag: () => {},
            onWrite: () => navigate(urlForPost.postCreate("free")),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={listIsLoading}
          isError={isError}
          errorText={errorText}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          empty={{ message: "등록된 게시글이 없습니다." }}
          renderAuthorLabel={(it) =>
            authorLabelMap.get(it.authorId ?? String(it.author)) ?? it.author
          }
        />
      </section>
    </div>
  );
}
