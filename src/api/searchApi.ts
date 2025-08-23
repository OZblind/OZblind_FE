import api from "@api/client";
import axios from "axios";
import { BOARD_ID, type BoardSlug } from "@constants/boards";
import type { Post, Category, SearchPreview } from "@src/types/search";

interface PostResponse {
  id: number;
  title: string;
  content?: string;
  user: number | string;
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

// API 응답을 Post 타입으로 변환
const transformPostResponse = (response: PostResponse): Post => {
  return {
    id: response.id,
    title: response.title,
    content: response.content?.replace(/<[^>]*>/g, "") || "", // HTML 태그 제거
    author:
      typeof response.user === "string"
        ? response.user
        : `사용자${response.user}`,
    category: BOARD_ID_TO_CATEGORY[response.board] || "기타",
    createdAt: response.created_at,
    viewCount: response.view_count,
  };
};

// 검색 미리보기 API 함수
export const searchPreviewApi = async (
  query: string,
  category: Category,
  maxResults: number,
  _accessToken?: string, // 팀 API 클라이언트에서 자동 처리
  signal?: AbortSignal
): Promise<SearchPreview> => {
  try {
    // 빈 검색어이고 전체 카테고리인 경우 빈 결과 반환
    if (!query.trim() && category === "전체") {
      return { posts: [], totalCount: 0 };
    }

    // 검색 파라미터 구성
    const params: {
      board?: BoardSlug;
      search?: string;
      page_size?: number;
    } = {};

    // 카테고리별 처리
    const boardSlug = CATEGORY_TO_BOARD_SLUG[category];
    if (boardSlug) {
      params.board = boardSlug;
    }

    // 검색어가 있으면 추가
    if (query.trim()) {
      params.search = query;
    }

    // 최대 결과 개수 제한
    params.page_size = maxResults;

    // 파라미터가 없으면 빈 결과 반환
    if (!params.search && !params.board) {
      return { posts: [], totalCount: 0 };
    }

    // API 호출 (기존 fetchPosts 함수와 동일한 패턴)
    const queryString = new URLSearchParams();
    if (params.board) queryString.set("board", String(BOARD_ID[params.board]));
    if (params.search) queryString.set("search", params.search);
    if (params.page_size)
      queryString.set("page_size", String(params.page_size));

    const { data } = await api.get<
      { results?: PostResponse[] } | PostResponse[]
    >(`/api/posts/?${queryString.toString()}`, {
      signal,
      timeout: 10000,
    });

    // 응답 데이터 처리 - API 문서에 따르면 배열 또는 단일 객체 반환 가능
    let rawPosts: PostResponse[] = [];
    if (Array.isArray(data)) {
      rawPosts = data;
    } else if (data?.results && Array.isArray(data.results)) {
      rawPosts = data.results;
    } else if (data) {
      // 단일 객체인 경우 (검색 결과 1개)
      rawPosts = [data as PostResponse];
    }

    const posts = rawPosts.map(transformPostResponse);

    return {
      posts,
      totalCount: posts.length,
    };
  } catch (error: unknown) {
    // 요청이 취소된 경우
    if (axios.isCancel(error) || (error as Error).name === "AbortError") {
      throw error;
    }

    // 404 에러는 검색 결과 없음으로 처리
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { posts: [], totalCount: 0 };
    }

    // 네트워크 에러 등 기타 에러
    console.error("Search API Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
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
  pageSize: number = 20
): Promise<{
  posts: Post[];
  totalCount: number;
  currentPage: number;
}> => {
  try {
    const params: {
      board?: BoardSlug;
      search?: string;
      page?: number;
      page_size?: number;
    } = {};

    const boardSlug = CATEGORY_TO_BOARD_SLUG[category];
    if (boardSlug) {
      params.board = boardSlug;
    }

    if (query.trim()) {
      params.search = query;
    }

    params.page = page;
    params.page_size = pageSize;

    // 기존 fetchPosts 패턴 재사용
    const queryString = new URLSearchParams();
    if (params.board) queryString.set("board", String(BOARD_ID[params.board]));
    if (params.search) queryString.set("search", params.search);
    if (params.page) queryString.set("page", String(params.page));
    if (params.page_size)
      queryString.set("page_size", String(params.page_size));

    const { data } = await api.get<
      | {
          results?: PostResponse[];
          count?: number;
        }
      | PostResponse[]
    >(`/api/posts/?${queryString.toString()}`);

    let posts: Post[] = [];
    let totalCount = 0;

    if (Array.isArray(data)) {
      posts = data.map(transformPostResponse);
      totalCount = posts.length;
    } else if (data?.results) {
      posts = data.results.map(transformPostResponse);
      totalCount = data.count || posts.length;
    }

    return {
      posts,
      totalCount,
      currentPage: page,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { posts: [], totalCount: 0, currentPage: page };
    }

    console.error("Full Search API Error:", error);
    throw new Error("검색 중 오류가 발생했습니다.");
  }
};
