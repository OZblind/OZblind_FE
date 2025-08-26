// 북마크 아이템 타입
export interface BookmarkItem {
  id: number;
  postId: number;
  category: string;
  title: string;
  date: string;
  bookmarkedDate: string;
  views?: number;
  comments?: number;
}

// 댓글 아이템 타입
export interface CommentItem {
  id: number;
  postTitle: string;
  postCategory: string;
  commentContent: string;
  date: string;
  postId: number;
}

// 게시글 아이템 타입
export interface PostItem {
  id: number;
  category: string;
  title: string;
  date: string;
  views?: number;
  comments?: number;
  authorId?: number;
}

// 마이페이지 카드 아이템 타입
export interface MyPageCardItem {
  id: number;
  postId?: number;
  title: string;
  date: string;
  category?: string;
}

// 마이페이지 카드 데이터 타입
export interface MyPageCardData {
  title: string;
  count: number;
  icon: string;
  path: string;
  items: MyPageCardItem[];
}

// 사용자 프로필 타입
export interface UserProfile {
  nickname?: string;
  userId?: string;
  profileImage?: string;
  hasKey?: boolean;
  cohort?: string;
  department?: string;
}

// 페이지네이션 관련 타입
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

// API 응답 타입들
export interface MyPageApiResponse<T> {
  success: boolean;
  data: T[];
  pagination?: PaginationInfo;
  message?: string;
}

// 북마크 API 응답
export type BookmarksResponse = MyPageApiResponse<BookmarkItem>;

// 댓글 API 응답
export type CommentsResponse = MyPageApiResponse<CommentItem>;

// 게시글 API 응답
export type PostsResponse = MyPageApiResponse<PostItem>;

// 삭제 요청 타입
export interface DeleteRequest {
  ids: number[];
}

// 삭제 응답 타입
export interface DeleteResponse {
  success: boolean;
  deletedCount: number;
  message: string;
}
