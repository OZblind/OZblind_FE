import axios from "axios";
import { API_BASE_URL } from "@src/config/env";
import { tokenStore } from "@src/api/client"; // tokenStore import
import type { HotPost, PatchHotPostsResponse } from "@src/types/hotPost";

// GET - 인기 게시글 가져오기
export async function fetchHotPosts(csrfToken: string): Promise<HotPost[]> {
  const access = tokenStore.access;
  if (!access) {
    throw new Error("Access token이 없습니다. 로그인 상태를 확인해주세요.");
  }

  const res = await axios.get<HotPost[]>(`${API_BASE_URL}/api/posts/hot`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access}`,
      "X-CSRFToken": csrfToken,
    },
    withCredentials: true,
  });

  return res.data;
}

// PATCH - 인기 게시글 갱신
export async function patchHotPosts(
  csrfToken: string
): Promise<PatchHotPostsResponse> {
  const access = tokenStore.access;
  if (!access) {
    throw new Error("Access token이 없습니다. 로그인 상태를 확인해주세요.");
  }

  const res = await axios.patch<PatchHotPostsResponse>(
    `${API_BASE_URL}/api/posts/hot`,
    {},
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${access}`,
        "X-CSRFToken": csrfToken,
      },
      withCredentials: true,
    }
  );

  return res.data;
}
