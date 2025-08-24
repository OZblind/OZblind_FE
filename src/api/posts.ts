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
}) {
  const query = new URLSearchParams();

  if (params?.board) query.set("board", String(BOARD_ID[params.board]));
  if (params?.search) query.set("search", params.search);
  if (params?.ordering) query.set("ordering", params.ordering);
  if (params?.page) query.set("page", String(params.page));
  if (params?.page_size) query.set("page_size", String(params.page_size));

  try {
    const { data } = await api.get<
      { results?: PostListItem[]; next?: string } | PostListItem[]
    >(`/api/posts/?${query.toString()}`);
    return Array.isArray(data) ? data : data?.results ?? [];
  } catch (e: unknown) {
    const err = e as AxiosError;
    if (err.response?.status === 404) {
      if (import.meta.env.DEV) {
        console.info("[useInfiniteQuery] 더 불러올 데이터 없음 (404 수신)");
      }
      return [];
    }
    // 404가 아니면 그대로 throw
    throw err;
  }
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

type Key = string;
const keyOf = (id: string | number): Key => String(id);

// === Anti-duplicate view: 상세 호출 단일화 + 짧은 캐시(TTL) ==================
// 동일 postId 동시 호출 결합
const _detailInflight = new Map<Key, Promise<PostDetail>>();

// 짧은 메모리 캐시 (기본 30초)
const _detailCache = new Map<Key, { data: PostDetail; exp: number }>();

/** (선택) 외부에서 상세 응답을 바로 캐시에 심고 싶을 때 사용 */
export function primePostDetailCache(
  id: string | number,
  data: PostDetail,
  ttlMs = 30_000
) {
  const key = keyOf(id);
  _detailCache.set(key, { data, exp: Date.now() + ttlMs });
}

/** 상세 조회를 최대 1회로 제한하고, TTL 내 재사용 */
export async function fetchPostDetailCached(
  id: string | number,
  opts?: { ttlMs?: number; force?: boolean }
): Promise<PostDetail> {
  const key = keyOf(id);
  const ttlMs = opts?.ttlMs ?? 30_000;
  const force = opts?.force ?? false;

  const now = Date.now();
  const cached = _detailCache.get(key);
  if (!force && cached && cached.exp > now) {
    return cached.data;
  }

  const inflight = _detailInflight.get(key);
  if (inflight) return inflight;

  const p = (fetchPostDetail as (x: string | number) => Promise<PostDetail>)(id)
    .then((data) => {
      _detailCache.set(key, { data, exp: now + ttlMs });
      return data;
    })
    .finally(() => _detailInflight.delete(key));

  _detailInflight.set(key, p);
  return p;
}
