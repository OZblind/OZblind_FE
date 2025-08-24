import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "@api/posts";
import type { SurveyCardProps } from "@components/Board/survey/SurveyCard";
import {
  mapToSurveyCard,
  type SurveyExtra,
} from "@src/features/posts/list/adapters";
import { fetchSurveyExtra } from "@src/api/posts.special";
import { LIST_SETTINGS } from "@src/constants/ui";
import type { AxiosError } from "axios";
import AssignedTagList from "@components/tags/AssignedTagList";
import { adaptUserTag } from "@src/features/tags/adapters";
import type { RawUserTag } from "@api/tags";
import type { SortValue } from "@src/types/sort";

const SORT_TO_ORDERING: Record<
  SortValue,
  "-created_at" | "created_at" | "-view_count" | "view_count"
> = {
  latest: "-created_at",
  oldest: "created_at",
  mostViewed: "-view_count",
  leastViewed: "view_count",
};

export const SURVEYS_KEY = ["surveys"] as const;
const PAGE_SIZE = LIST_SETTINGS.ITEMS_PER_PAGE;

type Page = { items: SurveyCardProps[]; hasMore: boolean; page: number };

/** 작성자 태그 원본 타입 가드 */
const isRawUserTag = (u: unknown): u is RawUserTag =>
  typeof u === "object" &&
  u !== null &&
  typeof (u as { id?: unknown }).id === "number" &&
  (u as { tag_class?: unknown }).tag_class !== undefined &&
  typeof (u as { tag_number?: unknown }).tag_number === "number";

export function useSurveys(sort: SortValue = "latest") {
  return useInfiniteQuery<Page, unknown>({
    // 페이지 크기 등이 바뀌면 캐시 키 분리되도록 포함
    queryKey: [
      ...SURVEYS_KEY,
      { pageSize: PAGE_SIZE, ordering: SORT_TO_ORDERING[sort] },
    ],
    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      // 1) 기본 목록
      const list = await fetchPosts({
        board: "survey",
        ordering: SORT_TO_ORDERING[sort],
        page: pageParam as number, // DRF 1-base
        page_size: PAGE_SIZE,
      });

      // 2) 부가정보 병렬 요청 (빈 목록이면 생략)
      const extrasMap =
        list.length === 0
          ? new Map<number, SurveyExtra>()
          : new Map<number, SurveyExtra>(
              await Promise.all(
                list.map(async (p) => {
                  try {
                    const ex = await fetchSurveyExtra(p.id);
                    return [p.id, ex] as [number, SurveyExtra];
                  } catch {
                    return [p.id, {}] as [number, SurveyExtra];
                  }
                })
              )
            );

      // 3) UI 매핑
      const items: SurveyCardProps[] = list.map((p) => {
        const card = mapToSurveyCard(p, extrasMap.get(p.id));
        const maybeUser = (p as unknown as { user?: unknown }).user;
        const rawUser = isRawUserTag(maybeUser) ? maybeUser : null;
        const authorTags = adaptUserTag(rawUser);

        (card as any).createdAtMs = Date.parse((p as any).created_at ?? 0) || 0;
        (card as any).responseCount = Number(
          (p as any).response_count ??
            (p as any).participants ??
            (p as any).votes ??
            (p as any).view_count ?? // 최종 폴백
            0
        );

        return authorTags.length > 0
          ? {
              ...card,
              tagSlot: React.createElement(AssignedTagList, {
                tags: authorTags,
              }),
            }
          : card;
      });

      return {
        items,
        // 마지막 페이지 길이가 PAGE_SIZE 미만이면 불러올 것 더 없음
        hasMore: list.length >= PAGE_SIZE,
        page: pageParam as number,
      };
    },

    // hasMore 기반 다음 페이지 계산
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),

    // 404는 "끝" 신호로 보고 재시도/에러 전환 방지
    retry: (failureCount, err) => {
      const ae = err as AxiosError | undefined;
      if (ae?.response?.status === 404) return false;
      return failureCount < 2;
    },

    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    // 필요 시: refetchOnWindowFocus: false,
  });
}
