import { api } from "@api/client";
import { deleteComment } from "@src/api/comments";
import type {
  BookmarkItem,
  PostItem,
  MyPageCardData,
  BookmarksResponse,
  PostsResponse,
  DeleteResponse,
  DeleteRequest,
} from "@src/types/mypage";

// 내 태그 조회 API
export interface UserTag {
  tag_class: string;
  tag_number: number;
}

// MyPage 전용 댓글 타입 (CommentMeta와 구분)
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

// 보드 이름 변환
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

// 내가 쓴 글 목록 (이것만 실제 API 사용)
export const getMyPosts = async (
  page: number = 1,
  pageSize: number = 20
): Promise<PostsResponse> => {
  try {
    const userTagResponse = await api.get<UserTag>("/api/user/tag", {
      withCredentials: true,
    });
    const { tag_class, tag_number } = userTagResponse.data;

    const res = await api.get("/api/posts/", {
      params: {
        page,
        page_size: pageSize,
        user_tag_class: tag_class,
        user_tag_number: tag_number,
      },
      withCredentials: true,
    });

    return {
      success: true,
      data: res.data.results.map(
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
          date: post.created_at,
          views: post.view_count,
          comments: post.comment_count || 0,
        })
      ),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(res.data.count / pageSize),
        itemsPerPage: pageSize,
        totalItems: res.data.count,
      },
    };
  } catch (error) {
    console.error("게시글 조회 실패:", error);
    throw error;
  }
};

// 댓글 조회 - 임시로 빈 데이터 반환
export const getMyComments = async (
  page: number = 1,
  pageSize: number = 20
): Promise<MyPageCommentsResponse> => {
  // 백엔드 API 구현 대기 중
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
};

// 북마크 목록 조회 - 임시로 빈 데이터 반환
export const getMyBookmarks = async (
  page: number = 1,
  pageSize: number = 20
): Promise<BookmarksResponse> => {
  // 백엔드 API 구현 대기 중
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
};

// 활동 요약 - 작성글 미리보기 데이터 포함
export const getMyActivitySummary = async (): Promise<MyPageCardData[]> => {
  try {
    // 작성글 실제 데이터 조회 (미리보기용 3개)
    let postsResult: PostsResponse | null = null;
    try {
      postsResult = await getMyPosts(1, 3);
    } catch (error) {
      console.warn("작성글 데이터 조회 실패:", error);
    }

    return [
      {
        title: "작성글",
        count: postsResult?.pagination?.totalItems || 0,
        icon: "posts",
        path: "posts",
        items:
          postsResult?.data?.map((post) => ({
            id: post.id,
            title: post.title,
            date: post.date,
            category: post.category,
          })) || [],
      },
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
  } catch (error) {
    console.error("활동 요약 조회 실패:", error);
    return [
      {
        title: "작성글",
        count: 0,
        icon: "posts",
        path: "posts",
        items: [],
      },
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

// 북마크 삭제 - 현재 API 없음
export const deleteBookmarks = async (
  bookmarkIds: number[]
): Promise<DeleteResponse> => {
  console.warn("북마크 삭제 API가 아직 구현되지 않음");

  return {
    success: false,
    deletedCount: 0,
    message: "북마크 삭제 기능이 준비 중입니다.",
  };
};

// 댓글 삭제 (팀원의 deleteComment 함수 사용)
export const deleteComments = async (
  commentIds: number[]
): Promise<DeleteResponse> => {
  try {
    const deletePromises = commentIds.map((id) => deleteComment(id));
    await Promise.all(deletePromises);

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

// 게시글 삭제 (개별 삭제만 지원)
export const deletePosts = async (
  postIds: number[]
): Promise<DeleteResponse> => {
  try {
    const deletePromises = postIds.map((id) =>
      api.delete(`/api/posts/${id}/`, { withCredentials: true })
    );

    await Promise.all(deletePromises);

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
