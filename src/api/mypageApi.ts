import { api } from "@api/client";
import { deleteComment } from "@src/api/comments";
import type {
  BookmarkItem,
  PostItem,
  MyPageCardData,
  BookmarksResponse,
  PostsResponse,
  DeleteResponse,
} from "@src/types/mypage";
import { isAxiosError } from "axios";
import { formatYyMmDd } from "@src/utils/utils";

export interface UserTag {
  tag_class: string;
  tag_number: number;
}

export interface MyPageCommentItem {
  id: number;
  postId: number;
  postTitle: string;
  postCategory: string;
  commentContent: string;
  date: string;
}

export interface MyPageCommentsResponse {
  success: boolean;
  data: MyPageCommentItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
}

// 게시판 id -> 이름
function getBoardName(boardId: number): string {
  const map: Record<number, string> = {
    1: "자유",
    2: "취업",
    3: "정보",
    4: "설문",
    5: "GitHub",
  };
  return map[boardId] || "일반";
}

// 게시글 상세 1건 조회(제목/보드/작성일 보강용)
async function fetchPostDetail(
  postId: number
): Promise<{ title: string; board: number; created_at: string }> {
  const res = await api.get(`/api/posts/${postId}/`, { withCredentials: true });
  return {
    title: res.data?.title ?? "",
    board: res.data?.board ?? 0,
    created_at: res.data?.created_at ?? "",
  };
}

export const getMyProfile = async (): Promise<UserTag> => {
  try {
    const res = await api.get<UserTag>("/api/user/tag", {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("내 태그 조회 실패:", error);
    throw error;
  }
};

// 내가 쓴 글 목록
export const getMyPosts = async (
  page: number = 1,
  pageSize: number = 20
): Promise<PostsResponse> => {
  const res = await api.get("/api/posts/", {
    params: { page, page_size: pageSize },
    withCredentials: true,
  });

  const data: PostItem[] = (res.data?.results ?? []).map(
    (post: {
      id: number;
      board: number;
      title: string;
      created_at: string;
      view_count: number;
      comment_count?: number;
    }): PostItem => ({
      id: post.id,
      category: getBoardName(post.board),
      title: post.title,
      // 여기서 날짜 변환
      date: formatYyMmDd(new Date(post.created_at)),
      views: post.view_count,
      comments: post.comment_count ?? 0,
    })
  );

  return {
    success: true,
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.max(1, Math.ceil((res.data?.count ?? 0) / pageSize)),
      itemsPerPage: pageSize,
      totalItems: res.data?.count ?? 0,
    },
  };
};

// 내 댓글 목록: GET /api/comments/me
export const getMyComments = async (
  page: number = 1,
  pageSize: number = 20
): Promise<MyPageCommentsResponse> => {
  try {
    const res = await api.get("/api/comments/me", { withCredentials: true });
    // 명세 예시가 단건이지만 실제로는 배열일 수 있으므로 안전 처리
    const payload = res.data;

    const raw: Array<{
      id: number;
      post: number;
      content: string;
      created_at?: string;
      updated_at?: string;
    }> = Array.isArray(payload) ? payload : payload ? [payload] : [];

    const uniquePostIds = [
      ...new Set(raw.map((c) => c.post).filter(Boolean)),
    ] as number[];

    const detailMap = new Map<
      number,
      { title: string; board: number; created_at: string }
    >();

    await Promise.all(
      uniquePostIds.map(async (pid) => {
        try {
          const d = await fetchPostDetail(pid);
          detailMap.set(pid, d);
        } catch {
          detailMap.set(pid, { title: "", board: 0, created_at: "" });
        }
      })
    );

    const allItems: MyPageCommentItem[] = raw.map((c) => {
      const d = detailMap.get(c.post);
      return {
        id: c.id,
        postId: c.post,
        postTitle: d?.title ?? "(제목 없음)",
        postCategory: getBoardName(d?.board ?? 0),
        commentContent: c.content,
        date: c.created_at ?? d?.created_at ?? "",
      };
    });

    // 클라 페이지네이션
    const start = (page - 1) * pageSize;
    const pageItems = allItems.slice(start, start + pageSize);
    const totalItems = allItems.length;

    return {
      success: true,
      data: pageItems,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
        itemsPerPage: pageSize,
        totalItems,
      },
    };
  } catch (error) {
    console.error("작성댓글 조회 실패:", error);
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 0,
        totalItems: 0,
      },
    };
  }
};

export const getMyBookmarks = async (
  page: number = 1,
  pageSize: number = 20
): Promise<BookmarksResponse> => {
  try {
    let res;
    try {
      res = await api.get("/api/bookmarks/me", { withCredentials: true });
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response?.status === 404) {
        return {
          success: true,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 0,
            totalItems: 0,
          },
        };
      }
      res = await api.get("/api/bookmarks/me/", { withCredentials: true });
    }

    const payload = res.data;

    let list: Array<{ postId: number; title: string }> | null = null;
    if (payload && Array.isArray(payload.bookmarks)) {
      list = payload.bookmarks as Array<{ postId: number; title: string }>;
    }

    if (!list && Array.isArray(payload)) {
      type RawB = { post?: { postId?: number | string; title?: unknown } };

      const tmp: { postId: number; title: string }[] = [];
      for (const item of payload as unknown[]) {
        const p = (item as RawB).post;
        const rawId = p?.postId;
        const numId =
          typeof rawId === "number"
            ? rawId
            : typeof rawId === "string"
            ? Number(rawId)
            : NaN;

        if (Number.isFinite(numId)) {
          tmp.push({
            postId: numId,
            title: typeof p?.title === "string" ? p.title : "",
          });
        }
      }
      list = tmp;
    }

    const raw = list ?? [];

    // 상세 정보 보강 (카테고리/작성일)
    const uniquePostIds = [
      ...new Set(raw.map((b) => b.postId).filter(Boolean)),
    ] as number[];
    const detailMap = new Map<
      number,
      { title: string; board: number; created_at: string }
    >();

    await Promise.all(
      uniquePostIds.map(async (pid) => {
        try {
          const d = await fetchPostDetail(pid);
          detailMap.set(pid, d);
        } catch {
          detailMap.set(pid, { title: "", board: 0, created_at: "" });
        }
      })
    );

    const allItems: BookmarkItem[] = raw.map((b) => {
      const d = detailMap.get(b.postId);
      return {
        id: b.postId, // 삭제 API가 post_id 기준이라 id=postId로 세팅
        postId: b.postId,
        title: d?.title || b.title || "(제목 없음)",
        category: getBoardName(d?.board ?? 0),
        date: d?.created_at ?? "",
        bookmarkedDate: "", // 백엔드에 북마크일시가 없어서 빈 값
      };
    });

    const start = (page - 1) * pageSize;
    const pageItems = allItems.slice(start, start + pageSize);

    return {
      success: true,
      data: pageItems,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(allItems.length / pageSize)),
        itemsPerPage: pageSize,
        totalItems: allItems.length,
      },
    };
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return {
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          itemsPerPage: 0,
          totalItems: 0,
        },
      };
    }
    console.error("북마크 조회 실패:", error);
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 0,
        totalItems: 0,
      },
    };
  }
};

export const getMyActivitySummary = async (): Promise<MyPageCardData[]> => {
  try {
    const [postsResult, commentsResult, bookmarksResult] = await Promise.all([
      getMyPosts(1, 3).catch(() => null),
      getMyComments(1, 3).catch(() => null),
      getMyBookmarks(1, 3).catch(() => null),
    ]);

    return [
      {
        title: "작성글",
        count: postsResult?.pagination?.totalItems ?? 0,
        icon: "posts",
        path: "posts",
        items:
          postsResult?.data?.map((post) => ({
            id: post.id,
            postId: post.id,
            title: post.title,
            date: post.date,
            category: post.category,
          })) ?? [],
      },
      {
        title: "작성댓글",
        count: commentsResult?.pagination?.totalItems ?? 0,
        icon: "comments",
        path: "comments",
        items:
          commentsResult?.data?.map((c) => ({
            id: c.id,
            postId: c.postId,
            title: c.postTitle,
            date: c.date,
            category: c.postCategory,
          })) ?? [],
      },
      {
        title: "북마크",
        count: bookmarksResult?.pagination?.totalItems ?? 0,
        icon: "bookmarks",
        path: "bookmarks",
        items:
          bookmarksResult?.data?.map((b) => ({
            id: b.id,
            postId: b.postId,
            title: b.title,
            date: b.date,
            category: b.category,
          })) ?? [],
      },
    ];
  } catch (error) {
    console.error("활동 요약 조회 실패:", error);
    return [
      { title: "작성글", count: 0, icon: "posts", path: "posts", items: [] },
      {
        title: "작성댓글",
        count: 0,
        icon: "comments",
        path: "comments",
        items: [],
      },
      {
        title: "북마크",
        count: 0,
        icon: "bookmarks",
        path: "bookmarks",
        items: [],
      },
    ];
  }
};

// 북마크 삭제: DELETE /api/bookmarks/{post_id}/
export const deleteBookmarks = async (
  bookmarkIds: number[]
): Promise<DeleteResponse> => {
  try {
    await Promise.all(
      bookmarkIds.map((postId) =>
        api.delete(`/api/bookmarks/${postId}/`, { withCredentials: true })
      )
    );
    return {
      success: true,
      deletedCount: bookmarkIds.length,
      message:
        bookmarkIds.length === 1
          ? "북마크가 삭제되었습니다."
          : `${bookmarkIds.length}개의 북마크가 삭제되었습니다.`,
    };
  } catch (error) {
    console.error("북마크 삭제 실패:", error);
    throw error;
  }
};

// 댓글 삭제: 기존 팀원 deleteComment 사용
export const deleteComments = async (
  commentIds: number[]
): Promise<DeleteResponse> => {
  try {
    await Promise.all(commentIds.map((id) => deleteComment(id)));
    return {
      success: true,
      deletedCount: commentIds.length,
      message:
        commentIds.length === 1
          ? "댓글이 삭제되었습니다"
          : `${commentIds.length}개의 댓글이 삭제되었습니다`,
    };
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    throw error;
  }
};

// 게시글 삭제: DELETE /api/posts/{id}/
export const deletePosts = async (
  postIds: number[]
): Promise<DeleteResponse> => {
  try {
    await Promise.all(
      postIds.map((id) =>
        api.delete(`/api/posts/${id}/`, { withCredentials: true })
      )
    );

    return {
      success: true,
      deletedCount: postIds.length,
      message:
        postIds.length === 1
          ? "게시글이 삭제되었습니다"
          : `${postIds.length}개의 게시글이 삭제되었습니다`,
    };
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    throw error;
  }
};
