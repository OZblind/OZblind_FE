// src/api/posts.ts
import api from "@api/client";
import { BOARD_ID, type BoardSlug } from "@constants/boards";
import { getBoardIdBySlug } from "./boardMap";
import type { AxiosError } from "axios";

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
  user?: { id: string | number } | null;
  user_id?: string | number;
  author_id?: string | number;
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
  board: BoardSlug; // "free" | "jobs" | "info"
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
  page?: number; // DRF는 1-base, 0은 절대 보내지 않기
  page_size?: number;
  user_tag_class?: "FE" | "BE";
  user_tag_number?: number;
}) {
  const query = new URLSearchParams();

  if (params?.board) query.set("board", String(BOARD_ID[params.board]));
  if (params?.search) query.set("search", params.search);
  if (params?.ordering) query.set("ordering", params.ordering);
  if (params?.page) query.set("page", String(params.page));
  if (params?.page_size) query.set("page_size", String(params.page_size));
  if (params?.user_tag_class) {
    query.set("user_tag_class", params.user_tag_class);
  }
  if (typeof params?.user_tag_number === "number") {
    query.set("user_tag_number", String(params.user_tag_number));
  }

  try {
    const { data } = await api.get<
      { results?: PostListItem[]; next?: string } | PostListItem[]
    >(`/api/posts/?${query.toString()}`);
    return Array.isArray(data) ? data : data?.results ?? [];
  } catch (e: unknown) {
    const err = e as AxiosError;
    if (err.response?.status === 404 || err.response?.status === 500) {
      if (import.meta.env.DEV) {
        console.info(
          "[useInfiniteQuery] 불러올 데이터 없음 (",
          err.response?.status,
          " 수신)"
        );
      }
      return [];
    }
    // 404가 아니면 그대로 throw
    throw err;
  }
}

export async function fetchPostDetail(id: number) {
  // api 접두어
  const { data } = await api.get<PostDetail>(`/api/posts/${id}/`);
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
    // JSON 전송
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

    const { data } = await api.patch<PostDetail>(`/api/posts/${id}/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } else {
    const { data } = await api.patch<PostDetail>(`/api/posts/${id}/`, rest);
    return data;
  }
}

export async function deletePost(id: number) {
  await api.delete(`/api/posts/${id}/`);
}

// ===== 단일호출(singleflight)만: 동시 중복 호출 합치기(캐시 없음) =====
type Key = string;
const keyOf = (id: string | number): Key => String(id);

const _inflight = new Map<Key, Promise<PostDetail>>();

/** 동일 postId로 동시에 들어오는 요청을 1번으로 합칩니다. (끝나면 inflight 제거) */
export async function fetchPostDetailSingleflight(
  id: string | number
): Promise<PostDetail> {
  const key = keyOf(id);

  const p = _inflight.get(key);
  if (p) return p;

  const run = (fetchPostDetail as (x: string | number) => Promise<PostDetail>)(
    id
  ).finally(() => {
    _inflight.delete(key);
  });

  _inflight.set(key, run);
  return run;
}
