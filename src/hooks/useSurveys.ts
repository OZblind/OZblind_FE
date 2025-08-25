// src/hooks/useSurveys.ts
import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts, type PostListItem } from "@api/posts";
import type { SurveyCardProps } from "@components/Board/survey/SurveyCard";
import {
  mapToSurveyCard,
  type SurveyExtra,
} from "@src/features/posts/list/adapters";
import { fetchSurveyExtra } from "@src/api/posts.special";
import { LIST_SETTINGS } from "@src/constants/ui";
import type { AxiosError } from "axios";
import AssignedTagList from "@components/tags/AssignedTagList";
import { adaptUserTag, isRawUserTag } from "@src/features/tags/adapters";
import type { TagFilter } from "@src/types/tag";

export type UseSurveysOpts = {
  pageSize?: number;
  tags?: TagFilter; // { tagClass?: "FE"|"BE"; cohort?: number }
};

// 정렬용 메타를 포함한 카드 타입 (추가 필드: createdAtMs, responseCount)
export type SortableSurveyCard = SurveyCardProps & {
  createdAtMs: number;
  responseCount: number;
};

export const SURVEYS_KEY = ["surveys"] as const;
const DEFAULT_PAGE_SIZE = LIST_SETTINGS.ITEMS_PER_PAGE;

type Page = { items: SortableSurveyCard[]; hasMore: boolean; page: number };

// 안전하게 숫자 속성 뽑아오는 유틸
function pickNumber(obj: unknown, keys: string[], fallback: number): number {
  for (const k of keys) {
    if (
      obj &&
      typeof obj === "object" &&
      k in (obj as Record<string, unknown>)
    ) {
      const v = (obj as Record<string, unknown>)[k];
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return fallback;
}

export function useSurveys(opts: UseSurveysOpts = {}) {
  const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  const tags = opts.tags;

  return useInfiniteQuery<Page, unknown>({
    queryKey: [...SURVEYS_KEY, { pageSize, tags }],
    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      // 1) 목록 호출 (최신순 고정)
      const list: PostListItem[] = await fetchPosts({
        board: "survey",
        ordering: "-created_at",
        page: pageParam as number, // DRF 1-base
        page_size: pageSize,
        user_tag_class: tags?.tagClass,
        user_tag_number:
          typeof tags?.cohort === "number" ? tags!.cohort : undefined,
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
                    return [p.id, {} as SurveyExtra] as [number, SurveyExtra];
                  }
                })
              )
            );

      // 3) UI 매핑 + 작성자 태그 배지 + 정렬 메타 필드 계산
      const items: SortableSurveyCard[] = list.map((p) => {
        const baseCard = mapToSurveyCard(p, extrasMap.get(p.id));

        const maybeUser = (p as unknown as { user?: unknown }).user;
        const rawUser = isRawUserTag(maybeUser) ? maybeUser : null;
        const authorTags = adaptUserTag(rawUser);

        const extra = extrasMap.get(p.id);
        const createdAtMs = Date.parse(p.created_at ?? "") || 0;
        const responseCount = pickNumber(
          extra,
          ["response_count", "participants", "votes"],
          Number(p.view_count ?? 0)
        );

        const withMeta: SortableSurveyCard = {
          ...baseCard,
          createdAtMs,
          responseCount,
        };

        return authorTags.length > 0
          ? {
              ...withMeta,
              tagSlot: React.createElement(AssignedTagList, {
                tags: authorTags,
              }),
            }
          : withMeta;
      });

      return {
        items,
        hasMore: list.length >= pageSize,
        page: pageParam as number,
      };
    },

    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),

    retry: (failureCount, err) => {
      const ae = err as AxiosError | undefined;
      if (ae?.response?.status === 404) return false;
      return failureCount < 2;
    },

    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}
