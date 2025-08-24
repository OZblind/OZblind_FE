import { api } from "@api/client";
import { mockMyPageCards } from "@src/mocks/mypage.mock";
import type {
  BookmarkItem,
  CommentItem,
  MyPageCardData,
  BookmarksResponse,
  CommentsResponse,
  PostsResponse,
  DeleteResponse,
  UserProfile,
} from "@src/types/mypage";

// 서버 응답 타입 정의
interface ProfileApiResponse {
  id: number;
  email: string;
  profile_image: string;
  role: string;
  is_active: boolean;
}

interface BookmarkApiResponse {
  post: {
    postId: number;
    title: string;
  };
}

interface CommentApiResponse {
  id: number;
  post: number;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PostApiResponse {
  id: number;
  board: number;
  title: string;
  user: {
    id: number;
    tag_class: string;
    tag_number: number;
  };
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

interface PostsListApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostApiResponse[];
}

export async function getMyProfile(): Promise<UserProfile> {
  try {
    const { data } = await api.get<ProfileApiResponse>("/api/profile", {
      withCredentials: true,
    });
    return {
      nickname: data.role || "사용자",
      userId: data.email?.split("@")[0] || "user",
      profileImage: data.profile_image,
      hasKey: data.is_active || false,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "프로필을 불러오지 못했습니다.";
    throw new Error(message);
  }
}

/** 내 북마크 목록 조회 */
export async function getMyBookmarks(_params: {
  page?: number;
  pageSize?: number;
}): Promise<BookmarksResponse> {
  try {
    const { data } = await api.get<BookmarkApiResponse[]>("/api/bookmarks/me", {
      withCredentials: true,
    });

    // API 응답: [{ "post": { "postId": 0, "title": "string" } }]
    const bookmarks: BookmarkItem[] = data.map(
      (item: BookmarkApiResponse, index: number) => ({
        id: item.post.postId || index + 1,
        postId: item.post.postId,
        category: "자유", // API에 카테고리 정보 없음
        title: item.post.title,
        date: new Date().toISOString().split("T")[0], // 생성일 정보 없음
        bookmarkedDate: new Date().toISOString().split("T")[0], // 북마크 일 정보 없음
        views: 0, // API에 조회수 정보 없음
        comments: 0, // API에 댓글수 정보 없음
      })
    );

    return {
      success: true,
      data: bookmarks,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: bookmarks.length,
        totalItems: bookmarks.length,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      // 북마크가 없는 경우
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
    const message =
      error instanceof Error ? error.message : "북마크를 불러오지 못했습니다.";
    throw new Error(message);
  }
}

/** 북마크 삭제 (post_id 기반으로 삭제) */
export async function deleteBookmarks(
  postIds: number[]
): Promise<DeleteResponse> {
  try {
    // 각 post_id로 북마크 삭제
    const deletePromises = postIds.map((postId) =>
      api.delete(`/api/bookmarks/${postId}/`, {
        withCredentials: true,
      })
    );

    await Promise.all(deletePromises);

    return {
      success: true,
      deletedCount: postIds.length,
      message: `${postIds.length}개의 북마크가 삭제되었습니다.`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "북마크를 삭제하지 못했습니다.";
    throw new Error(message);
  }
}

/** 내 댓글 목록 조회 */
export async function getMyComments(_params: {
  page?: number;
  pageSize?: number;
}): Promise<CommentsResponse> {
  try {
    const { data } = await api.get<CommentApiResponse | CommentApiResponse[]>(
      "/api/comments/me",
      {
        withCredentials: true,
      }
    );

    // API 응답이 단일 객체인 경우 배열로 변환
    const commentsArray: CommentApiResponse[] = Array.isArray(data)
      ? data
      : [data];

    const comments: CommentItem[] = commentsArray.map(
      (item: CommentApiResponse) => ({
        id: item.id,
        postTitle: `게시글 ${item.post}`, // API에 게시글 제목 정보 없음
        postCategory: "자유", // 카테고리 정보 없음
        commentContent: item.content,
        date:
          item.created_at?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        postId: item.post,
      })
    );

    return {
      success: true,
      data: comments,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: comments.length,
        totalItems: comments.length,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.";
    throw new Error(message);
  }
}

/** 내 게시글 목록 조회 (전체 게시글에서 필터링) */
export async function getMyPosts(params: {
  page?: number;
  pageSize?: number;
}): Promise<PostsResponse> {
  try {
    // 1. 현재 사용자 정보 가져오기
    const profile = await getMyProfile();
    const currentUserId = profile.userId;

    // 2. 전체 게시글 목록 가져오기 (페이지 크기를 크게 설정)
    const { data } = await api.get<PostsListApiResponse>("/api/posts/", {
      params: {
        page_size: 100, // 충분한 크기로 설정
        ordering: "-created_at", // 최신순
      },
      withCredentials: true,
    });

    // 3. 현재 사용자가 작성한 게시글만 필터링
    const myPosts = data.results.filter((post) => {
      // user.id와 현재 사용자 ID 비교
      // 또는 다른 식별 방법이 필요할 수 있음
      return (
        post.user.id.toString() === currentUserId ||
        post.user.id.toString() === profile.userId
      );
    });

    // 4. PostItem 형태로 변환
    const transformedPosts = myPosts.map((post) => ({
      id: post.id,
      category: getBoardName(post.board),
      title: post.title,
      date: post.created_at.split("T")[0],
      views: post.view_count,
      comments: 0, // API에 댓글 수 정보 없음
    }));

    // 5. 페이지네이션 적용 (클라이언트 사이드)
    const startIndex = ((params?.page || 1) - 1) * (params?.pageSize || 5);
    const endIndex = startIndex + (params?.pageSize || 5);
    const paginatedPosts = transformedPosts.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedPosts,
      pagination: {
        currentPage: params?.page || 1,
        totalPages: Math.ceil(
          transformedPosts.length / (params?.pageSize || 5)
        ),
        itemsPerPage: params?.pageSize || 5,
        totalItems: transformedPosts.length,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.";
    throw new Error(message);
  }
}

// 게시판 ID를 카테고리명으로 변환하는 헬퍼 함수
function getBoardName(boardId: number): string {
  const boardNames: Record<number, string> = {
    1: "자유",
    2: "취업",
    3: "정보",
    4: "설문",
    5: "GitHub",
  };
  return boardNames[boardId] || "기타";
}

/** 마이페이지 메인 활동 요약 데이터 */
export async function getMyActivitySummary(): Promise<MyPageCardData[]> {
  try {
    // TODO: 실제 API가 구현되면 다음과 같이 호출
    // const [bookmarks, comments, posts] = await Promise.all([
    //   getMyBookmarks({ page: 1, pageSize: 3 }),
    //   getMyComments({ page: 1, pageSize: 3 }),
    //   getMyPosts({ page: 1, pageSize: 3 })
    // ]);

    // 임시로 mock 데이터 사용
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockMyPageCards;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "활동 요약을 불러오지 못했습니다.";
    throw new Error(message);
  }
}
