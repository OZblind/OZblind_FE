import axios from "axios";
import type { SearchPreview, Category } from "@src/types/search";
import { categoryMapping } from "@src/types/search";

export const searchPreviewApi = async (
  query: string,
  category: Category,
  maxResults: number,
  accessToken?: string,
  signal?: AbortSignal
): Promise<SearchPreview> => {
  try {
    const response = await axios.get("/api/posts/search", {
      params: {
        q: query.trim(),
        category: categoryMapping[category],
        limit: maxResults,
        offset: 0,
      },
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      signal,
    });

    return {
      posts: response.data.posts || [],
      totalCount: response.data.totalCount || 0,
    };
  } catch (error) {
    // AbortError는 정상적인 취소이므로 로그하지 않음
    if (axios.isCancel(error) || (error as Error).name === "AbortError") {
      throw error;
    }
    console.error("Search preview API error:", error);
    return {
      posts: [],
      totalCount: 0,
    };
  }
};
