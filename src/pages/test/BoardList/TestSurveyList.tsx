import { useMemo, useState } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { SurveyList } from "@components/Board/survey";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { useSurveysMock } from "@hooks/useSurveys.mock";
import type { SurveyCardProps } from "@components/Board/survey/SurveyCard";
import { useNavigate } from "react-router-dom";
import { urlForPost } from "@src/utils/urlForPost";

type Page = { items: SurveyCardProps[]; hasMore: boolean };
const SURVEYS_MOCK_KEY = ["surveys-mock"] as const;

export default function TestSurveyList() {
  const navigate = useNavigate();

  const qc = useQueryClient();
  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );

  const [forcedError, setForcedError] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
  } = useSurveysMock();

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "600px 0px",
    threshold: 0,
    disabled: isFetchingNextPage || !hasNextPage || !!forcedError || isError,
    onIntersect: async () => {
      await fetchNextPage();
    },
  });

  const handleRefresh = () => {
    setForcedError(null);
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    refetch();
  };

  const resetAll = () => {
    setForcedError(null);
    qc.removeQueries({ queryKey: SURVEYS_MOCK_KEY });
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
  };

  const clearItems = () => {
    const emptyData: InfiniteData<Page> = {
      pages: [{ items: [], hasMore: false }],
      pageParams: [0],
    };
    qc.setQueryData<InfiniteData<Page>>(SURVEYS_MOCK_KEY, emptyData);
    setForcedError(null);
  };

  const toggleError = () => {
    setForcedError((e) => (e ? null : "의도적 테스트 에러"));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">
          Survey 리스트 본문 — UI 테스트
        </h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={resetAll}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={clearItems}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            비우기(Empty)
          </button>
          <button
            type="button"
            onClick={toggleError}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            에러 상태 토글
          </button>
        </div>
      </header>

      {/* ❗️ 본문 내 스크롤 적용 시 부모(wrapper)엔 높이가 있어야 함 ❗️ */}
      <section className="rounded-xl border p-3 pb-8 h-[calc(100vh-100px)] overflow-hidden">
        <div className="text-xs opacity-70 mb-2">
          hasMore: {String(!!hasNextPage)} / busy: {String(isFetchingNextPage)}{" "}
          / items: {items.length}
          {(isError || !!forcedError) && (
            <span className="ml-2 text-red-500">
              | error: {forcedError ?? (error as Error)?.message ?? "에러"}
            </span>
          )}
        </div>

        <SurveyList
          items={items}
          onItemClick={(id) => navigate(urlForPost.postDetail("survey", id))}
          topBar={{
            boardName: "설문 게시판",
            onOpenSort: () => console.log("정렬 필터 열기"),
            onOpenTag: () => console.log("태그 필터 열기"),
            onWrite: () => navigate(urlForPost.postCreate("survey")),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={isFetchingNextPage}
          isError={!!forcedError || isError}
          errorText={forcedError ?? (error as Error)?.message}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          empty={{ message: "등록된 설문이 없습니다." }}
        />
      </section>
    </div>
  );
}
