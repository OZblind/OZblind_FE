import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "@api/posts";
import type { SurveyCardProps } from "@components/Board/survey/SurveyCard";
import {
  mapToSurveyCard,
  type SurveyExtra,
} from "@src/features/posts/list/adapters";
import { fetchSurveyExtra } from "@src/api/posts.special";

export const SURVEYS_KEY = ["surveys"] as const;
const PAGE_SIZE = 20;

type Page = { items: SurveyCardProps[]; hasMore: boolean; page: number };

export function useSurveys() {
  return useInfiniteQuery<Page>({
    queryKey: SURVEYS_KEY,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      // 1) 기본 목록 불러오기
      const list = await fetchPosts({
        board: "survey",
        ordering: "-created_at",
        page: pageParam as number,
        page_size: PAGE_SIZE,
      });

      // 2) 각 아이템의 설문 부가정보를 병렬로 불러서 맵으로 만든다
      const extrasArr = await Promise.all(
        list.map(async (p) => {
          try {
            const ex = await fetchSurveyExtra(p.id);
            return [p.id, ex] as [number, SurveyExtra];
          } catch {
            return [p.id, {}] as [number, SurveyExtra];
          }
        })
      );
      const extrasMap = new Map<number, SurveyExtra>(extrasArr);

      // 3) SurveyCardProps로 매핑(+ extras 합치기)
      const items = list.map((p) => mapToSurveyCard(p, extrasMap.get(p.id)));

      return {
        items,
        hasMore: list.length === PAGE_SIZE,
        page: pageParam as number,
      };
    },
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
}
