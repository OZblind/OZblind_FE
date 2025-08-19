import { useInfiniteQuery } from "@tanstack/react-query";
import type { SurveyCardProps } from "@components/Board/survey/SurveyCard";

// 태그 목 유틸
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
    const closeAt = new Date(now + ((idx % 6) - 2) * 86_400_000).toISOString();
    const status: SurveyCardProps["status"] =
      new Date(closeAt).getTime() < Date.now() ? "expired" : "active";

    // 지정 태그 2개 (기수 + 포지션)
    const cohort: CohortLabel = COHORTS[9 + (idx % 5)];
    const position: PositionLabel = POSITIONS[idx % 2];
    const tags = makeAssignedTags(cohort, position);

    const link = `https://forms.example.com/surveys/${idx + 1}/very/long/path?utm_source=board&ref=survey_${idx + 1}`;

    return {
      id: `survey-${idx + 1}`,
      status,
      title: `오즈의 여섯 가지 그림자 — 설문 ${idx + 1}`,
      desc: "오즈 커뮤니티 설문(지정 태그 칩 표시 테스트)",
      deadline: closeAt,
      tags,
      link,
      onClick: undefined,
    };
  });
}

// 여기를 실 API로 추후 교체하기
async function fetchMockPage(pageIndex: number) {
  await new Promise((r) => setTimeout(r, 500));
  const start = pageIndex * PAGE_SIZE;
  const items = makeMockItems(PAGE_SIZE, start);
  const hasMore = pageIndex + 1 < MAX_PAGES;
  return { items, hasMore };
}

export function useSurveysMock() {
  return useInfiniteQuery({
    queryKey: ["surveys-mock"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => fetchMockPage(pageParam as number),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    refetchOnWindowFocus: false,
    retry: 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * ⚙️ 실제 API 연결 시 메모:
 * - fetchMockPage → fetchRealPage 로 교체
 * - queryKey를 ["surveys", { boardId, ...filters }] 로 확장
 * - getNextPageParam은 next/hasMore 로 그대로
 */
