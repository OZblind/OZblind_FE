export type CommentBase = {
  id: number;
  post: number; // post id
  root?: number | null; // 루트댓글이면 자기 id, 대댓글이면 루트댓글 id
  content: string;
};

export type CommentFull = CommentBase & {
  like_count: number;
  dislike_count: number;
  created_at: string;
  updated_at: string;
  user?: number; // 백엔드에서 보내줄 수도 있음(Serializer에 따라)
};

// 생성 응답(백엔드 규격: id, post, root, content만 옴)
export type CreateCommentResponse = Pick<
  CommentBase,
  "id" | "post" | "root" | "content"
>;

// 내 댓글 목록 응답
export type MyCommentItem = {
  id: number;
  post: number;
  content: string;
  created_at: string;
  updated_at: string;
};

export type CommentMeta = {
  id: number;
  post: number;
  root?: number | null;
  author: string; // 백엔드에서 user.username 반환 or 직렬화 수정 필요
  authorId: number; // user pk
  content: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  dislikeCount: number;
  replies?: CommentMeta[];
};
