import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SurveyList } from "@components/Board/survey";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { useSurveys } from "@src/hooks/useSurveys";
import { urlForPost } from "@src/utils/urlForPost";
import type { SurveyCardProps } from "@components/Board/survey/SurveyCard";

export default function SurveyListPage() {
  const nav = useNavigate();

  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    refetch,
  } = useSurveys();

  // 훅이 이미 SurveyCardProps[]를 반환하므로 플랫만 하면 됨
  const items: SurveyCardProps[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  // 초기 로딩/스켈레톤 제어
  const isInitialLoading = items.length === 0 && !!isFetching;
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
          items={items}
          onItemClick={(id) => nav(urlForPost.postDetail("survey", id))}
          topBar={{
            boardName: "설문 게시판",
            onOpenSort: () => {}, // TODO[UI→API-SORT]: 정렬 상태를 useSurveys 파라미터로 연결
            onOpenTag: () => {}, // TODO[UI→API-TAGS]: 태그 필터를 훅/서버에 연결
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
        />
      </section>
    </div>
  );
}
