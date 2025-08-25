import { api } from "@api/client";

// --- Response Types (백엔드 스키마 반영) ---
export type BookmarkCreateResponse = {
  status: "success";
  message: string; // "북마크가 생성되었습니다."
  data: { post: { id: number; post_id: number } }; // bookmark.id, post.id
};

export type BookmarkDeleteResponse = {
  status: "success";
  message: string; // "삭제완료"
};

export type BookmarkedPost = {
  postId: number;
  title: string;
};

export type MyBookmarksResponse = {
  status: "success";
  bookmarks: BookmarkedPost[];
};

// --- API functions ---
/** 게시글 북마크 추가 (이미 있으면 400) */
export async function addBookmark(postId: number) {
  const { data } = await api.post<BookmarkCreateResponse>(
    `/api/bookmarks/${postId}/`,
    null,
    { withCredentials: true }
  );
  return data;
}

/** 게시글 북마크 삭제 */
export async function removeBookmark(postId: number) {
  const { data } = await api.delete<BookmarkDeleteResponse>(
    `/api/bookmarks/${postId}/`,
    { withCredentials: true }
  );
  return data;
}

/** 내 북마크 목록 */
export async function fetchMyBookmarks() {
  const { data } = await api.get<MyBookmarksResponse>("/api/bookmarks/me");
  return data.bookmarks;
}
