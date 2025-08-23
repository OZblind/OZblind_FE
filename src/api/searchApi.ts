import type { SearchPreview, Category } from "@src/types/search";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const searchPreviewApi = async (
  _query: string,
  _category: Category,
  _maxResults: number,
  _accessToken?: string,
  _signal?: AbortSignal
): Promise<SearchPreview> => {
  // 미리보기 기능 제거 - 빈 결과 반환
  // 백엔드 API가 단일 결과만 반환하므로 미리보기 기능 대신
  // 검색창을 통합검색 페이지로 이동하는 용도로만 사용
  return {
    posts: [],
    totalCount: 0,
  };
};
/* eslint-enable @typescript-eslint/no-unused-vars */
