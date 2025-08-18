import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyList } from "@components/Board/survey";
import type { SurveyCardProps } from "@components/Board/survey/SurveyCard";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import {
  makeAssignedTags,
  COHORTS,
  POSITIONS,
  type CohortLabel,
  type PositionLabel,
} from "@src/mocks/tags.mock";

const PAGE_SIZE = 12;
const MAX_PAGES = 4;

function makeMockItems(count: number, startIndex: number): SurveyCardProps[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;

    // 마감일: 과거/미래 섞기 → expired/active
    const closeAt = new Date(now + ((idx % 6) - 2) * 86_400_000);
    const status: SurveyCardProps["status"] =
      closeAt.getTime() < Date.now() ? "expired" : "active";

    // 지정 태그 2개
    const cohort: CohortLabel = COHORTS[9 + (idx % 5)];
    const position: PositionLabel = POSITIONS[idx % 2];

    // ✅ 설문 링크(길게)
    const link = `https://forms.example.com/surveys/${idx + 1}/very/long/path/that/should/truncate?utm_source=board&ref=survey_${
      idx + 1
    }`;

    return {
      id: `survey-${idx + 1}`,
      status,
      title: `오즈의 여섯 가지 그림자 — 설문 ${idx + 1}`,
      desc: "오즈 커뮤니티 설문(지정 태그 칩 표시 테스트)",
      deadline: closeAt.toISOString(),
      tags: makeAssignedTags(cohort, position),
      link, // ✅ 추가
      onClick: undefined, // List에서 바인딩
    };
  });
}

export default function TestSurveyList() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<SurveyCardProps[]>(() =>
    makeMockItems(PAGE_SIZE, 0)
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<string>(
    formatYyyyMmDdHms(new Date())
  );

  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const hasMore = useMemo(() => page < MAX_PAGES, [page]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMoreRef.current) return;
    busyRef.current = true;
    if (mountedRef.current) setBusy(true);
    setErr(null);
    try {
      await new Promise((r) => setTimeout(r, 500)); // mock API
      const nextPage = pageRef.current + 1;
      if (!mountedRef.current) return;
      setItems((prev) => [...prev, ...makeMockItems(PAGE_SIZE, prev.length)]);
      setPage(nextPage);
      pageRef.current = nextPage;
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    } finally {
      if (mountedRef.current) setBusy(false);
      busyRef.current = false;
    }
  }, []);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const { sentinelRef } = useInfiniteScroll({
    root: null,
    rootMargin: "1000px 0px",
    threshold: 0,
    disabled: busy || !hasMore || !!err,
    onIntersect: loadMore,
  });

  const clearItems = () => setItems([]);
  const toggleError = () => setErr((e) => (e ? null : ": 의도적 테스트 에러"));
  const resetAll = () => {
    setPage(1);
    pageRef.current = 1;
    setItems(makeMockItems(PAGE_SIZE, 0));
    setBusy(false);
    busyRef.current = false;
    setErr(null);
    hasMoreRef.current = true;
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Survey 리스트 본문 — 테스트</h1>
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

      <section className="rounded-xl border p-3">
        <div className="text-xs opacity-70 mb-2">
          page: {page} / hasMore: {String(hasMore)} / busy: {String(busy)} /
          items: {items.length}
          {err && <span className="ml-2 text-red-500">| error: {err}</span>}
        </div>

        <SurveyList
          items={items}
          onItemClick={(id) => console.log("go detail:", id)}
          topBar={{
            boardName: "설문 게시판",
            onOpenSort: () => console.log("정렬 필터 열기"),
            onOpenTag: () => console.log("태그 필터 열기"),
            onWrite: () => console.log("글쓰기 이동"),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={() => setLastLoadedAt(formatYyyyMmDdHms(new Date()))}
          isLoading={busy}
          isError={!!err}
          errorText={err ?? undefined}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
          empty={{ message: "등록된 설문이 없습니다." }}
        />
      </section>
    </div>
  );
}
