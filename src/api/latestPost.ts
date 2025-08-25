// src/api/posts.ts
import axios from "axios";
import type { Post } from "../types/latestPost";
import { API_BASE_URL } from "@src/config/env";
import { tokenStore } from "@api/client";
import { LIST_SETTINGS } from "@src/constants/ui";

// 최신글 불러오기 (GET)
export const getLatestPosts = async (page = 1): Promise<Post[]> => {
  const response = await axios.get<Post[]>(`${API_BASE_URL}/api/posts/main`, {
    params: {
      page,
      page_size: LIST_SETTINGS.ITEMS_PER_PAGE,
    },
    headers: {
      Authorization: `Bearer ${tokenStore.access}`,
    },
    withCredentials: true,
  });
  return response.data;
};
