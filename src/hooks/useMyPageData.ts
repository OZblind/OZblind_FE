// src/hooks/useMyPageData.ts
import {
  useQuery,
  useMutation,
  useIsFetching,
  keepPreviousData, // ✅ v5 방식
} from "@tanstack/react-query";
import {
  getMyActivitySummary,
  getMyBookmarks,
  getMyComments,
  getMyPosts,
  deleteBookmarks as deleteBookmarksApi,
} from "@src/api/mypageApi";
import type {
  BookmarksResponse,
  PostsResponse,
  MyPageCardData,
} from "@src/types/mypage";
import type { MyPageCommentsResponse } from "@src/api/mypageApi";

/* ========== 공통 유틸 ========== */
function toErrorMessage(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/* ========== Activity Summary ========== */
export function useMyActivitySummary() {
  const q = useQuery<MyPageCardData[]>({
    queryKey: ["mypage", "summary"] as const,
    queryFn: () => getMyActivitySummary(),
    staleTime: 60_000,
    retry: 1,
    // v5: 필요하면 placeholderData 사용 가능
    // placeholderData: [],
  });
  return { ...q, data: q.data ?? [] };
}

/* ========== 북마크 목록/삭제 ========== */
export function useMyBookmarks(page: number, pageSize: number) {
  return useQuery<BookmarksResponse>({
    queryKey: ["mypage", "bookmarks", page, pageSize] as const,
    queryFn: () => getMyBookmarks(page, pageSize),
    // ✅ v5 교체: keepPreviousData 대신
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

export function useDeleteBookmarks() {
  const m = useMutation({
    mutationFn: (ids: number[]) => deleteBookmarksApi(ids),
  });
  return {
    mutate: m.mutate,
    isPending: m.isPending,
    isSuccess: m.isSuccess,
    isError: m.isError,
    error: m.error,
  };
}

/* ========== 댓글/게시글 목록 ========== */
export function useMyComments(page: number, pageSize: number) {
  return useQuery<MyPageCommentsResponse>({
    queryKey: ["mypage", "comments", page, pageSize] as const,
    queryFn: () => getMyComments(page, pageSize),
    // ✅ v5 방식
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

export function useMyPosts(page: number, pageSize: number) {
  return useQuery<PostsResponse>({
    queryKey: ["mypage", "posts", page, pageSize] as const,
    queryFn: () => getMyPosts(page, pageSize),
    // ✅ v5 방식
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

/* ========== 페이징/로딩/에러 상태 ========== */
export function useMyPagePagination<
  T extends { pagination?: { totalPages?: number } }
>(
  data: T | undefined,
  currentPage: number,
  setCurrentPage: (p: number) => void
) {
  const totalPages = Math.max(1, Number(data?.pagination?.totalPages ?? 1));
  const onPageChange = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== currentPage) setCurrentPage(next);
  };
  return { totalPages, onPageChange };
}

export function useMyPageLoadingState() {
  const fetching = useIsFetching();
  return { isAnyLoading: fetching > 0 };
}

export function useMyPageError(
  errorLike: unknown,
  refetch?: () => Promise<unknown> | unknown
) {
  const hasError = !!errorLike;
  const errorMessage = hasError ? toErrorMessage(errorLike) : "";
  const retry = refetch
    ? () => {
        try {
          const r = refetch();
          if (r && typeof (r as Promise<unknown>).then === "function") {
            return r as Promise<unknown>;
          }
        } catch {
          /* noop */
        }
        return Promise.resolve();
      }
    : undefined;

  return { hasError, errorMessage, retry };
}
