// src/api/posts.ts
import api from "@api/client";
import { BOARD_ID, type BoardSlug } from "@constants/boards";
import { getBoardIdBySlug } from "./boardMap";

/** ----- 타입 ----- */
export type PostListItem = {
  id: number;
  title: string;
  user: number | string;
  board: number;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
};

export type PostDetail = {
  id: number;
  title: string;
  content: string; // HTML/Markdown 그대로
  user: number | string;
  board: number;
  image?: string | null;
  view_count: number;
  like_count: number;
  dislike_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
  root_comments?: unknown[]; // 필요 시 구체 타입 지정
};

export type CreatePostPayload = {
  board: BoardSlug; // "free" | "job" | "info"
  title: string;
  content: string;
  image?: string | File | Blob | null;
};

export type UpdatePostPayload = Partial<Omit<CreatePostPayload, "board">> & {
  id: number;
};

/** ----- API 함수 ----- */
export async function fetchPosts(params?: {
  board?: BoardSlug; // 슬러그로 받되 내부에서 id로 변환
  search?: string;
  ordering?: "-created_at" | "created_at" | "-view_count" | "view_count";
  page?: number;
  page_size?: number;
}) {
  const query = new URLSearchParams();

  if (params?.board) query.set("board", String(BOARD_ID[params.board]));
  if (params?.search) query.set("search", params.search);
  if (params?.ordering) query.set("ordering", params.ordering);
  if (params?.page) query.set("page", String(params.page));
  if (params?.page_size) query.set("page_size", String(params.page_size));

  // 프록시 제거: /api 접두어 필수
  const { data } = await api.get<{ results?: PostListItem[] } | PostListItem[]>(
    `/api/posts/?${query.toString()}`
  );

  return Array.isArray(data) ? data : data?.results ?? [];
}

export async function fetchPostDetail(id: number) {
  // api 접두어
  const { data } = await api.get<PostDetail>(`/api/posts/${id}`);
  return data; // (상세 진입 시 서버가 조회수+1 처리한다고 가정)
}

export async function createPost(payload: CreatePostPayload) {
  const boardId = await getBoardIdBySlug(payload.board);
  if (!boardId) throw new Error("유효하지 않은 게시판입니다.");

  const title = payload.title?.trim();
  const content = payload.content ?? "";
  if (!title || !content.trim()) {
    throw new Error("제목과 내용을 입력하세요.");
  }

  const isFileLike =
    payload.image instanceof File || payload.image instanceof Blob;

  if (isFileLike) {
    // 파일 업로드: FormData 사용, Content-Type을 multipart/form-data로 덮어쓰기
    const form = new FormData();
    form.append("board", String(boardId));
    form.append("title", title);
    form.append("content", content);
    if (payload.image) form.append("image", payload.image as File | Blob);

    const { data } = await api.post<PostDetail>("/api/posts/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } else {
    // ✅ JSON 전송
    const body: Record<string, unknown> = {
      board: boardId,
      title,
      content,
    };
    // image가 문자열(이미 업로드된 URL)인 경우만 포함
    if (typeof payload.image === "string" && payload.image) {
      body.image = payload.image;
    }

    const { data } = await api.post<PostDetail>("/api/posts/", body);
    return data;
  }
}

export async function updatePost(payload: UpdatePostPayload) {
  const { id, ...rest } = payload;

  // 파일 포함 수정도 지원 (부분 수정)
  const isFileLike = rest.image instanceof File || rest.image instanceof Blob;

  if (isFileLike) {
    const form = new FormData();
    if (rest.title !== undefined) form.append("title", String(rest.title));
    if (rest.content !== undefined)
      form.append("content", String(rest.content));
    if (rest.image) form.append("image", rest.image as File | Blob);

    const { data } = await api.patch<PostDetail>(`/api/posts/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } else {
    const { data } = await api.patch<PostDetail>(`/api/posts/${id}`, rest);
    return data;
  }
}

export async function deletePost(id: number) {
  await api.delete(`/api/posts/${id}`);
}
