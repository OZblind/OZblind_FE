import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GithubList from "@components/Board/github/GithubList";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { urlForPost } from "@src/utils/urlForPost";
import { useGithubPosts, useGithubListWithLinks } from "@hooks/useGithubPosts";
import type { SortValue } from "@src/types/sort";

export default function GithubListPage() {
  const nav = useNavigate();
  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const [sort, setSort] = useState<SortValue>("latest");
  const [tagIds] = useState<number[] | undefined>(undefined);
  const [search] = useState<string | undefined>(undefined);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    refetch,
  } = useGithubPosts({
    sort,
    tagIds, // TODO(tags): Tag UI onApply → setTagIds
    search, // TODO(search): Search onSubmit → setSearch
    // pageSize: 10,           // 필요 시 교체
  });

  // 링크/OG까지 보강된 items + onRepoClick
  const { items, onRepoClick } = useGithubListWithLinks(data);

  const isInitialLoading = items.length === 0 && !!isFetching;
  const listIsLoading = isInitialLoading || isFetchingNextPage;

  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "400px 0px",
    threshold: 0,
    disabled: listIsLoading || !hasNextPage || isError,
    onIntersect: async () => {
      await fetchNextPage();
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    },
  });

  const handleRefresh = useCallback(() => {
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    refetch();
  }, [refetch]);

  const errorText = useMemo(() => {
    if (!isError) return undefined;
    if (error && typeof error === "object" && "message" in error) {
      return (error as { message?: string }).message;
    }
    return "GitHub 게시판 목록을 불러오는 중 문제가 발생했습니다.";
  }, [isError, error]);

  return (
    <div className="self-stretch w-[800px] max-w-full p-4">
      <section className="w-full rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-hidden">
        <GithubList
          items={items}
          onItemClick={(id) => nav(urlForPost.postDetail("github", id))}
          onRepoClick={onRepoClick}
          topBar={{
            boardName: "GitHub 게시판",
            // TODO(tags): 태그 팝오버 → 선택값 setTagIds → 훅 옵션 반영
            onOpenTag: () => {},
            onWrite: () => nav(urlForPost.postCreate("github")),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={listIsLoading}
          isError={isError}
          errorText={errorText}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          emptyText="등록된 GitHub 게시글이 없습니다."
          className="py-2"
          sortValue={sort}
          onChangeSort={(v) => {
            setSort(v);
            setLastLoadedAt(formatYyyyMmDdHms(new Date()));
            rootEl?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
          }}
        />
      </section>
    </div>
  );
}
