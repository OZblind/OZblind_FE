import { api } from "@api/client";
import { ENDPOINTS } from "@constants/endpoints";
import type {
  BookmarkItem,
  CommentItem,
  PostItem,
  MyPageCardData,
  BookmarksResponse,
  CommentsResponse,
  PostsResponse,
  DeleteResponse,
  UserProfile,
  PaginationInfo,
} from "@src/types/mypage";

export async function getMyProfile(): Promise<UserProfile> {
  try {
    const { data } = await api.get<UserProfile>(ENDPOINTS.USER_PROFILE, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "프로필을 불러오지 못했습니다.";
    throw new Error(message);
  }
}

/** 내 북마크 목록 조회 (페이지네이션) */
export async function getMyBookmarks(params: {
  page?: number;
  pageSize?: number;
}): Promise<BookmarksResponse> {
  const { page = 1, pageSize = 5 } = params;

  try {
    const { data } = await api.get<BookmarksResponse>(
      `${ENDPOINTS.MY_BOOKMARKS}`,
      {
        params: {
          page,
          page_size: pageSize,
        },
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "북마크를 불러오지 못했습니다.";
    throw new Error(message);
  }
}

/** 북마크 삭제 (단일/복수) */
export async function deleteBookmarks(
  bookmarkIds: number[]
): Promise<DeleteResponse> {
  try {
    const { data } = await api.delete<DeleteResponse>(
      `${ENDPOINTS.MY_BOOKMARKS}`,
      {
        data: { ids: bookmarkIds },
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "북마크를 삭제하지 못했습니다.";
    throw new Error(message);
  }
}

/** 내 댓글 목록 조회 (페이지네이션) */
export async function getMyComments(params: {
  page?: number;
  pageSize?: number;
}): Promise<CommentsResponse> {
  const { page = 1, pageSize = 5 } = params;

  try {
    const { data } = await api.get<CommentsResponse>(
      `${ENDPOINTS.MY_COMMENTS}`,
      {
        params: {
          page,
          page_size: pageSize,
        },
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.";
    throw new Error(message);
  }
}

/** 내 게시글 목록 조회 (페이지네이션) */
export async function getMyPosts(params: {
  page?: number;
  pageSize?: number;
}): Promise<PostsResponse> {
  const { page = 1, pageSize = 5 } = params;

  try {
    const { data } = await api.get<PostsResponse>(`${ENDPOINTS.MY_POSTS}`, {
      params: {
        page,
        page_size: pageSize,
      },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.";
    throw new Error(message);
  }
}

// ============================================================================
// 5. 활동 요약 API (메인 페이지용)
// ============================================================================

/** 마이페이지 메인 활동 요약 데이터 */
export async function getMyActivitySummary(): Promise<MyPageCardData[]> {
  try {
    const { data } = await api.get<{
      posts: { count: number; recent: PostItem[] };
      comments: { count: number; recent: CommentItem[] };
      bookmarks: { count: number; recent: BookmarkItem[] };
    }>(`${ENDPOINTS.MY_ACTIVITY_SUMMARY}`, {
      withCredentials: true,
    });

    // 서버 응답을 UI용 MyPageCardData 형태로 변환
    return [
      {
        title: "작성글",
        count: data.posts.count,
        icon: "📝",
        path: "posts",
        items: data.posts.recent.map((post) => ({
          id: post.id,
          title: post.title,
          date: post.date,
          category: post.category,
        })),
      },
      {
        title: "작성댓글",
        count: data.comments.count,
        icon: "💬",
        path: "comments",
        items: data.comments.recent.map((comment) => ({
          id: comment.id,
          title: comment.postTitle,
          date: comment.date,
          category: comment.postCategory,
        })),
      },
      {
        title: "북마크",
        count: data.bookmarks.count,
        icon: "🔖",
        path: "bookmarks",
        items: data.bookmarks.recent.map((bookmark) => ({
          id: bookmark.id,
          title: bookmark.title,
          date: bookmark.bookmarkedDate,
          category: bookmark.category,
        })),
      },
    ];
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "활동 요약을 불러오지 못했습니다.";
    throw new Error(message);
  }
}

/** 서버의 북마크 응답을 클라이언트 타입으로 변환 */
export function adaptBookmarkResponse(serverData: any): BookmarksResponse {
  return {
    success: true,
    data:
      serverData.results?.map((item: any) => ({
        id: item.id,
        postId: item.post_id || item.postId,
        category: item.category || item.post?.category || "일반",
        title: item.title || item.post?.title || "제목 없음",
        date: item.post?.created_at || item.date || "",
        bookmarkedDate: item.created_at || item.bookmarkedDate || "",
        views: item.post?.view_count || item.views || 0,
        comments: item.post?.comment_count || item.comments || 0,
      })) || [],
    pagination: {
      currentPage: serverData.current_page || 1,
      totalPages: serverData.total_pages || 1,
      itemsPerPage: serverData.page_size || 5,
      totalItems: serverData.total_count || 0,
    },
  };
}

/** 서버의 댓글 응답을 클라이언트 타입으로 변환 */
export function adaptCommentResponse(serverData: any): CommentsResponse {
  return {
    success: true,
    data:
      serverData.results?.map((item: any) => ({
        id: item.id,
        postTitle: item.post?.title || item.postTitle || "제목 없음",
        postCategory: item.post?.category || item.postCategory || "일반",
        commentContent: item.content || item.commentContent || "내용 없음",
        date: item.created_at || item.date || "",
        postId: item.post_id || item.postId || 0,
      })) || [],
    pagination: {
      currentPage: serverData.current_page || 1,
      totalPages: serverData.total_pages || 1,
      itemsPerPage: serverData.page_size || 5,
      totalItems: serverData.total_count || 0,
    },
  };
}

/** 서버의 게시글 응답을 클라이언트 타입으로 변환 */
export function adaptPostResponse(serverData: any): PostsResponse {
  return {
    success: true,
    data:
      serverData.results?.map((item: any) => ({
        id: item.id,
        category: item.category || "일반",
        title: item.title || "제목 없음",
        date: item.created_at || item.date || "",
        views: item.view_count || item.views || 0,
        comments: item.comment_count || item.comments || 0,
      })) || [],
    pagination: {
      currentPage: serverData.current_page || 1,
      totalPages: serverData.total_pages || 1,
      itemsPerPage: serverData.page_size || 5,
      totalItems: serverData.total_count || 0,
    },
  };
}
