import api from "@api/client";
import axios from "axios";
import sanitizeHtml from "sanitize-html";
import { ENDPOINTS } from "@constants/endpoints"; // 추가된 import
import { BOARD_ID, type BoardSlug } from "@constants/boards";
import type { Post, Category, SearchPreview } from "@src/types/search";
import type { RawUserTag } from "@src/types/tag";

interface PostResponse {
  id: number;
  title: string;
  content?: string;
  user: number | string | RawUserTag;
  board: number;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  root_comment?: unknown[];
}

// 게시판 ID to 카테고리 매핑
const BOARD_ID_TO_CATEGORY: Record<number, Category> = {
  [BOARD_ID.free]: "자유",
  [BOARD_ID.jobs]: "취업",
  [BOARD_ID.info]: "정보",
  [BOARD_ID.survey]: "설문",
  [BOARD_ID.github]: "GitHub",
};

// 카테고리 to 게시판 슬러그 매핑
const CATEGORY_TO_BOARD_SLUG: Record<Category, BoardSlug | null> = {
  전체: null,
  자유: "free",
  취업: "jobs",
  정보: "info",
  설문: "survey",
  GitHub: "github",
};

// 검색어 전처리 함수
const preprocessQuery = (query: string): string => {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
};

// 클라이언트 사이드 필터링 (영어 검색 정확도 개선)
const filterPostsByRelevance = (
  posts: Post[],
  originalQuery: string
): Post[] => {
  const query = preprocessQuery(originalQuery);

  if (query.length <= 2 || /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query)) {
    return posts;
  }

  if (/^[a-zA-Z\s]+$/.test(query)) {
    return posts.filter((post) => {
      const titleLower = post.title.toLowerCase();
      const contentLower = post.content.toLowerCase();
      const words = query.split(" ").filter((word) => word.length > 0);

      return words.some((word) => {
        const wordRegex = new RegExp(`\\b${word}\\b`, "i");
        return (
          wordRegex.test(titleLower) ||
          wordRegex.test(contentLower) ||
          titleLower.includes(word) ||
          contentLower.includes(word)
        );
      });
    });
  }

  return posts;
};

// API 응답을 Post 타입으로 변환
const transformPostResponse = (response: PostResponse): Post => {
  return {
    id: response.id,
    title: response.title,
    content: sanitizeHtml(response.content ?? "", {
      allowedTags: [],
      allowedAttributes: {},
    }),
    author:
      typeof response.user === "string"
        ? response.user
        : `사용자${response.user}`,
    category: BOARD_ID_TO_CATEGORY[response.board] || "기타",
    createdAt: response.created_at,
    viewCount: response.view_count,
  };
};

// 공통 API 호출 로직 - ENDPOINTS 상수 사용
const callSearchApi = async (
  queryParams: URLSearchParams,
  signal?: AbortSignal,
  timeout: number = 10000
) => {
  return await api.get<
    | {
        results?: PostResponse[];
        count?: number;
        next?: string | null;
      }
    | PostResponse[]
  >(`${ENDPOINTS.POST_DETAIL}/?${queryParams.toString()}`, {
    // POSTS로 변경
    signal,
    timeout,
  });
};

// 검색 미리보기 API 함수
export const searchPreviewApi = async (
  query: string,
  category: Category,
  maxResults: number,
  _accessToken?: string,
  signal?: AbortSignal
): Promise<SearchPreview> => {
  try {
    if (!query.trim()) {
      return { posts: [], totalCount: 0 };
    }

    const processedQuery = preprocessQuery(query);

    if (processedQuery.length < 1) {
      return { posts: [], totalCount: 0 };
    }

    const queryString = new URLSearchParams();

    const boardSlug = CATEGORY_TO_BOARD_SLUG[category];
    if (boardSlug) {
      queryString.set("board", String(BOARD_ID[boardSlug]));
    }

    queryString.set("search", processedQuery);
    queryString.set("page_size", String(maxResults));

    const { data } = await callSearchApi(queryString, signal);

    let rawPosts: PostResponse[] = [];
    if (Array.isArray(data)) {
      rawPosts = data;
    } else if (data?.results && Array.isArray(data.results)) {
      rawPosts = data.results;
    } else if (data) {
      rawPosts = [data as PostResponse];
    }

    let posts = rawPosts.map(transformPostResponse);
    posts = filterPostsByRelevance(posts, query);

    return {
      posts: posts.slice(0, maxResults),
      totalCount: posts.length,
    };
  } catch (error: unknown) {
    if (axios.isCancel(error) || (error as Error).name === "AbortError") {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { posts: [], totalCount: 0 };
      }

      if (error.response?.status === 400 || error.response?.status === 422) {
        console.warn("검색 파라미터 오류, 빈 결과 반환:", error.response?.data);
        return { posts: [], totalCount: 0 };
      }
    }

    console.error("Search API Error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : null,
      status: axios.isAxiosError(error) ? error.response?.status : null,
      query,
      category,
    });

    throw new Error("검색 중 오류가 발생했습니다.");
  }
};

// 전체 검색 결과 API (검색 결과 페이지용)
export const searchFullResultsApi = async (
  query: string,
  category: Category,
  page: number = 1,
  pageSize: number = 20,
  signal?: AbortSignal
): Promise<{
  posts: Post[];
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
}> => {
  try {
    if (!query.trim()) {
      return { posts: [], totalCount: 0, currentPage: page, hasNext: false };
    }

    const processedQuery = preprocessQuery(query);

    if (processedQuery.length < 1) {
      return { posts: [], totalCount: 0, currentPage: page, hasNext: false };
    }

    const queryString = new URLSearchParams();

    const boardSlug = CATEGORY_TO_BOARD_SLUG[category];
    if (boardSlug) {
      queryString.set("board", String(BOARD_ID[boardSlug]));
    }

    queryString.set("search", processedQuery);
    queryString.set("page", String(page));
    queryString.set("page_size", String(pageSize * 2));

    const { data } = await callSearchApi(queryString, signal, 15000);

    let posts: Post[] = [];
    let totalCount = 0;
    let hasNext = false;

    if (Array.isArray(data)) {
      posts = data.map(transformPostResponse);
      totalCount = posts.length;
      hasNext = posts.length === pageSize * 2;
    } else if (data?.results) {
      posts = data.results.map(transformPostResponse);
      totalCount = data.count || posts.length;
      hasNext = !!data.next;
    }

    const filteredPosts = filterPostsByRelevance(posts, query);
    const serverTotalCount = totalCount;
    const paginatedPosts = filteredPosts.slice(0, pageSize);
    const calculatedHasNext = hasNext && paginatedPosts.length === pageSize;

    return {
      posts: paginatedPosts,
      totalCount: serverTotalCount,
      currentPage: page,
      hasNext: calculatedHasNext,
    };
  } catch (error: unknown) {
    if (axios.isCancel(error) || (error as Error).name === "AbortError") {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return { posts: [], totalCount: 0, currentPage: page, hasNext: false };
      }

      if (error.response?.status === 400 || error.response?.status === 422) {
        console.warn("검색 파라미터 오류, 빈 결과 반환:", error.response?.data);
        return { posts: [], totalCount: 0, currentPage: page, hasNext: false };
      }
    }

    console.error("Full Search API Error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : null,
      status: axios.isAxiosError(error) ? error.response?.status : null,
    });

    throw new Error("검색 중 오류가 발생했습니다.");
  }
};
