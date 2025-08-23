import api from "@api/client";
import { BOARD_ID } from "@constants/boards";
import type { PostListItem } from "@api/posts";

export type GithubDetailResponse = { post_id?: number | string; link?: string };

/** GitHub 게시글 상세(링크만 필요) */
export async function fetchGithubLinkById(postId: string): Promise<string> {
  const { data } = await api.get<GithubDetailResponse>(
    `/api/posts/github/${postId}`
  );
  return typeof data.link === "string" ? data.link : "";
}

/** GitHub 게시판 목록 1페이지(페이지네이션 정보 포함) */
export async function fetchGithubListPage(params: {
  page: number;
  page_size: number;
  ordering?: "-created_at" | "created_at" | "-view_count" | "view_count";
}): Promise<{ items: PostListItem[]; hasNext: boolean }> {
  const { page, page_size, ordering = "-created_at" } = params;

  const { data } = await api.get<
    | {
        results?: PostListItem[];
        next?: string | null;
        previous?: string | null;
        count?: number;
      }
    | PostListItem[]
  >("/api/posts/", {
    params: {
      board: BOARD_ID.github, // ← 슬러그 매핑은 상수에서
      page,
      page_size,
      ordering,
    },
  });

  // DRF 표준: {count, next, previous, results}
  if (Array.isArray(data)) {
    // 백엔드가 배열로만 줄 수도 있음 → 다음 페이지 정보 없음
    return { items: data, hasNext: data.length === page_size };
  }

  const items = Array.isArray(data?.results) ? data.results : [];
  const hasNext = Boolean(data?.next); // ← “다음 페이지 존재 여부”를 API 레이어에서 결정
  return { items, hasNext };
}
