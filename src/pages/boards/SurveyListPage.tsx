import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SurveyList } from "@components/Board/survey";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { useSurveys } from "@src/hooks/useSurveys";
import { urlForPost } from "@src/utils/urlForPost";
import type { SortValue } from "@src/types/sort";
import sortClientSide from "@src/utils/sortClientSide";
import type { PositionValue } from "@src/types/tag";
import { posToTagClass } from "@utils/tagRules";
import type { SortableSurveyCard } from "@src/hooks/useSurveys";

export default function SurveyListPage() {
  const nav = useNavigate();

  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const [sort, setSort] = useState<SortValue>("latest");
  const [pos, setPos] = useState<PositionValue>("back");
  const [cohort, setCohort] = useState<number>(11);
  const [activeFilter, setActiveFilter] = useState<{
    pos: PositionValue;
    cohort: number;
  } | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    refetch,
  } = useSurveys({
    tags: activeFilter
      ? {
          tagClass: posToTagClass(activeFilter.pos),
          cohort: activeFilter.cohort,
        }
      : undefined,
  });

  // 플랫
  const items: SortableSurveyCard[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const sortedItems = useMemo(() => {
    return sortClientSide(items, sort, {
      createdAt: (it: SortableSurveyCard) => it.createdAtMs,
      viewCount: (it: SortableSurveyCard) => it.responseCount,
    });
  }, [items, sort]);

  // 초기 로딩/스켈레톤 제어
  const isInitialLoading = sortedItems.length === 0 && !!isFetching;
  const listIsLoading = isInitialLoading || isFetchingNextPage;

  // 무한 스크롤
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

  const errorText =
    isError && error && typeof error === "object" && "message" in error
      ? (error as { message?: string }).message
      : "설문 목록을 불러오는 중 문제가 발생했습니다.";

  return (
    <div className="self-stretch w-[800px] max-w-full p-4">
      <section className="w-full rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-hidden">
        <SurveyList
          items={sortedItems}
          onItemClick={(id) => nav(urlForPost.postDetail("survey", id))}
          topBar={{
            boardName: "설문 게시판",
            onWrite: () => nav(urlForPost.postCreate("survey")),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={listIsLoading}
          isError={isError}
          errorText={isError ? errorText : undefined}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          empty={{ message: "등록된 설문이 없습니다." }}
          className="py-2"
          sortValue={sort}
          onChangeSort={(v) => {
            setSort(v);
            setLastLoadedAt(formatYyyyMmDdHms(new Date()));
            rootEl?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
          }}
          tagValue={{ pos, cohort }}
          tagApplied={!!activeFilter}
          onApplyTag={(next) => {
            if (next) {
              setPos(next.pos);
              setCohort(next.cohort);
              setActiveFilter(next);
            } else {
              setActiveFilter(null);
            }
            setLastLoadedAt(formatYyyyMmDdHms(new Date()));
            rootEl?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
          }}
        />
      </section>
    </div>
  );
}
