import { api } from "@src/api/client"; // 기존 axios 인스턴스 (baseURL: https://www.ozboard.shop/api)
import type {
  CommentFull,
  CreateCommentResponse,
  MyCommentItem,
} from "@src/types/comment";

const PREFIX = "/comments";

export async function fetchCommentsByPost(
  postId: number
): Promise<CommentFull[]> {
  // 백엔드에 GET 추가했을 때 사용
  const { data } = await api.get<CommentFull[]>(`${PREFIX}`, {
    params: { post: postId },
  });
  return data;
}

export async function createRootComment(postId: number, content: string) {
  // root 없이 보내면 최상위로 생성됨
  const { data } = await api.post<CreateCommentResponse>(`${PREFIX}/`, {
    post: postId,
    content,
  });
  return data;
}

export async function createReplyComment(
  postId: number,
  rootId: number,
  content: string
) {
  // 반드시 root 필드로 보내야 함 (tests.py의 parent는 무시됨)
  const { data } = await api.post<CreateCommentResponse>(`${PREFIX}/`, {
    post: postId,
    root: rootId,
    content,
  });
  return data;
}

export async function updateComment(commentId: number, content: string) {
  // 응답: { message: string } 만 옴 → UI에서 낙관적 업데이트 or 재조회
  const { data } = await api.patch<{ message: string }>(
    `${PREFIX}/${commentId}`,
    { content }
  );
  return data;
}

export async function deleteComment(commentId: number) {
  // 200(소프트) 또는 204(하드)
  const res = await api.delete(`${PREFIX}/${commentId}`);
  return res.status; // 200 or 204
}

export async function fetchMyComments(): Promise<MyCommentItem[]> {
  const { data } = await api.get<MyCommentItem[]>(`${PREFIX}/me`);
  return data;
}
