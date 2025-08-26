import api from "@api/client";
import axios from "axios";
import DOMPurify from "dompurify"; // sanitize-html 대체
import { ENDPOINTS } from "@constants/endpoints";
import { BOARD_ID, type BoardSlug } from "@constants/boards";
import type { Post, Category, SearchPreview } from "@src/types/search";
import type { RawUserTag } from "@src/types/tag";

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

// 검색어 전처리 함수
const preprocessQuery = (query: string): string => {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
};

// 클라이언트 사이드 필터링 (영어 검색 정확도 개선 + 숫자 검색 지원)
const filterPostsByRelevance = (
  posts: Post[],
  originalQuery: string
): Post[] => {
  const query = preprocessQuery(originalQuery);

  // 검색어 유형 판별
  const isNumericQuery = /^\d+$/.test(query);
  const isEnglishQuery = /^[a-zA-Z\s]+$/.test(query);
  const isAlphanumericQuery = /^[a-zA-Z0-9\s]+$/.test(query);

  // 기존 조건 수정 - 숫자나 영어+숫자 검색은 예외 처리
  if (
    !isNumericQuery &&
    !isAlphanumericQuery &&
    (query.length <= 2 || /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query))
  ) {
    return posts;
  }

  // 숫자 검색 전용 필터링
  if (isNumericQuery) {
    return posts.filter((post) => {
      const titleLower = post.title.toLowerCase();
      const contentLower = post.content.toLowerCase();
      const queryStr = query;

      // 숫자가 포함되어 있는지 확인 (정확한 일치 + 부분 일치)
      const titleIncludes = titleLower.includes(queryStr);
      const contentIncludes = contentLower.includes(queryStr);
      const idMatch = post.id.toString() === queryStr; // ID 정확히 일치

      // 단어 경계를 고려한 정확한 숫자 매칭
      const numberRegex = new RegExp(`\\b${queryStr}\\b`);
      const titleExactMatch = numberRegex.test(titleLower);
      const contentExactMatch = numberRegex.test(contentLower);

      return (
        titleIncludes ||
        contentIncludes ||
        idMatch ||
        titleExactMatch ||
        contentExactMatch
      );
    });
  }

  // 영어 또는 영어+숫자 검색 로직
  if (isEnglishQuery || isAlphanumericQuery) {
    return posts.filter((post) => {
      const titleLower = post.title.toLowerCase();
      const contentLower = post.content.toLowerCase();

      // 전체 검색어로 먼저 검사 (정확한 일치 + 부분 일치)
      const titleIncludes = titleLower.includes(query);
      const contentIncludes = contentLower.includes(query);

      // 단어 경계를 고려한 정확한 매칭 (정규식 특수문자 이스케이프)
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const exactRegex = new RegExp(`\\b${escapedQuery}\\b`, "i");
      const titleExactMatch = exactRegex.test(titleLower);
      const contentExactMatch = exactRegex.test(contentLower);

      // 공백으로 나눠서 각 단어별로도 검사
      const words = query.split(/\s+/).filter((word) => word.length > 0);
      const wordMatch = words.some((word) => {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wordRegex = new RegExp(`\\b${escapedWord}\\b`, "i");
        return (
          wordRegex.test(titleLower) ||
          wordRegex.test(contentLower) ||
          titleLower.includes(word.toLowerCase()) ||
          contentLower.includes(word.toLowerCase())
        );
      });

      return (
        titleIncludes ||
        contentIncludes ||
        titleExactMatch ||
        contentExactMatch ||
        wordMatch
      );
    });
  }

  // 기타 검색어는 기존 로직 그대로
  return posts;
};

// sanitize-html → DOMPurify 대체: 모든 태그 제거(텍스트만 남김)
function stripAllHtml(html?: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

// API 응답을 Post 타입으로 변환
const transformPostResponse = (response: PostResponse): Post => {
  // user 객체에서 적절한 작성자 이름 생성
  let authorName = "익명";
  let userForTag: RawUserTag | undefined = undefined;

  if (typeof response.user === "string") {
    authorName = response.user;
  } else if (response.user && typeof response.user === "object") {
    // user 객체에서 적절한 표시명 생성
    const userObj = response.user as {
      id?: number;
      tag_class?: string;
      tag_number?: number;
    };
    if (userObj.tag_class && userObj.tag_number && userObj.id) {
      // RawUserTag 형태로 변환
      userForTag = {
        id: userObj.id,
        tag_class: userObj.tag_class as "FE" | "BE",
        tag_number: userObj.tag_number,
      };
      authorName = `${userObj.tag_class} ${userObj.tag_number}기`;
    } else {
      authorName = `사용자${userObj.id || ""}`;
    }
  } else if (typeof response.user === "number") {
    authorName = `사용자${response.user}`;
  }

  return {
    id: response.id,
    title: response.title,
    content: stripAllHtml(response.content), // ← DOMPurify 사용
    author: authorName,
    category: BOARD_ID_TO_CATEGORY[response.board] || "기타",
    createdAt: response.created_at,
    viewCount: response.view_count,
    user: userForTag, // RawUserTag 형태로 변환된 객체만 전달
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
  >(`${ENDPOINTS.POSTS}/?${queryParams.toString()}`, {
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
