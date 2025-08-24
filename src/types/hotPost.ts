export interface HotPost {
  id: number;
  board: number;
  title: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

// PATCH
export interface PatchHotPostsResponse {
  message: string;
}

// GET
export type GetHotPostsResponse = HotPost[];
