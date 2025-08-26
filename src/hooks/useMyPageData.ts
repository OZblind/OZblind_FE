import {
  useQuery,
  useMutation,
  useIsFetching,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getMyActivitySummary,
  getMyBookmarks,
  getMyComments,
  getMyPosts,
  deleteBookmarks as deleteBookmarksApi,
} from "@src/api/mypageApi";

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

// 메인 페이지용 - 적극적 캐싱과 백그라운드 업데이트
export function useMyActivitySummary() {
  const q = useQuery({
    queryKey: ["mypage", "summary"] as const,
    queryFn: getMyActivitySummary,
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지
    gcTime: 30 * 60 * 1000, // 30분간 캐시 보관
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 마운트시 리패치 안함 (캐시 우선)
    refetchOnReconnect: "always", // 재연결시에만 리패치
  });

  return { ...q, data: q.data ?? [] };
}

// 개별 데이터 페이지용 - 최적화된 캐싱
export function useMyBookmarks(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["mypage", "bookmarks", page, pageSize] as const,
    queryFn: () => getMyBookmarks(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 15 * 60 * 1000, // 15분간 캐시 보관
    retry: 1,
    retryDelay: 1000,
    refetchOnMount: false, // 캐시 우선
    refetchOnWindowFocus: false,
  });
}

export function useMyComments(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["mypage", "comments", page, pageSize] as const,
    queryFn: () => getMyComments(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useMyPosts(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["mypage", "posts", page, pageSize] as const,
    queryFn: () => getMyPosts(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// 삭제 mutation - 최적화된 캐시 업데이트
export function useDeleteBookmarks() {
  const queryClient = useQueryClient();

  const m = useMutation({
    mutationFn: (ids: number[]) => deleteBookmarksApi(ids),
    onSuccess: (_, deletedIds) => {
      // 즉시 UI 업데이트를 위한 optimistic update
      queryClient.setQueryData(
        ["mypage", "summary"],
        (
          old: ReturnType<typeof getMyActivitySummary> extends Promise<infer T>
            ? T
            : never
        ) => {
          if (!old) return old;
          return old.map((card) =>
            card.path === "bookmarks"
              ? {
                  ...card,
                  count: Math.max(0, card.count - deletedIds.length),
                  items: card.items.filter(
                    (item) => !item.postId || !deletedIds.includes(item.postId)
                  ),
                }
              : card
          );
        }
      );

      // 북마크 쿼리 무효화 (백그라운드에서 갱신)
      queryClient.invalidateQueries({
        queryKey: ["mypage", "bookmarks"],
        refetchType: "none", // 무효화만 하고 즉시 리패치 안함
      });

      // 1초 후 백그라운드에서 조용히 갱신
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: ["mypage", "bookmarks"],
          type: "active",
        });
      }, 1000);
    },
  });

  return {
    mutate: m.mutate,
    mutateAsync: m.mutateAsync,
    isPending: m.isPending,
    isSuccess: m.isSuccess,
    isError: m.isError,
    error: m.error,
    data: m.data,
    reset: m.reset,
  };
}

// 페이지네이션 - 메모화
export function useMyPagePagination<
  T extends {
    pagination?: {
      totalPages?: number;
      currentPage?: number;
      totalItems?: number;
      itemsPerPage?: number;
    };
  }
>(
  data: T | undefined,
  currentPage: number,
  setCurrentPage: (page: number) => void
) {
  const totalPages = Math.max(1, data?.pagination?.totalPages ?? 1);

  const onPageChange = (page: number) => {
    const nextPage = Math.min(Math.max(1, page), totalPages);
    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
    }
  };

  return {
    totalPages,
    onPageChange,
    currentPage,
    totalItems: data?.pagination?.totalItems ?? 0,
    itemsPerPage: data?.pagination?.itemsPerPage ?? 20,
  };
}

export function useMyPageLoadingState() {
  const fetching = useIsFetching();
  return { isAnyLoading: fetching > 0 };
}

export function useMyPageError(
  errorLike: unknown,
  refetch?: (() => Promise<unknown>) | (() => void)
) {
  const hasError = Boolean(errorLike);
  const errorMessage = hasError ? toErrorMessage(errorLike) : "";

  const retry = refetch
    ? async () => {
        try {
          const result = refetch();
          if (result && typeof result === "object" && "then" in result) {
            await result;
          }
        } catch (error) {
          console.error("Retry failed:", error);
          throw error;
        }
      }
    : undefined;

  return { hasError, errorMessage, retry };
}

// 데이터 프리로딩 훅 - 페이지 전환 전에 미리 로드
export function usePreloadMyPageData() {
  const queryClient = useQueryClient();

  const preloadPosts = (page: number = 1, pageSize: number = 20) => {
    queryClient.prefetchQuery({
      queryKey: ["mypage", "posts", page, pageSize],
      queryFn: () => getMyPosts(page, pageSize),
      staleTime: 5 * 60 * 1000,
    });
  };

  const preloadComments = (page: number = 1, pageSize: number = 20) => {
    queryClient.prefetchQuery({
      queryKey: ["mypage", "comments", page, pageSize],
      queryFn: () => getMyComments(page, pageSize),
      staleTime: 5 * 60 * 1000,
    });
  };

  const preloadBookmarks = (page: number = 1, pageSize: number = 20) => {
    queryClient.prefetchQuery({
      queryKey: ["mypage", "bookmarks", page, pageSize],
      queryFn: () => getMyBookmarks(page, pageSize),
      staleTime: 5 * 60 * 1000,
    });
  };

  // 카드별 프리로드 함수
  const preloadByCardType = (
    cardPath: string,
    page: number = 1,
    pageSize: number = 20
  ) => {
    switch (cardPath) {
      case "posts":
        preloadPosts(page, pageSize);
        break;
      case "comments":
        preloadComments(page, pageSize);
        break;
      case "bookmarks":
        preloadBookmarks(page, pageSize);
        break;
    }
  };

  return {
    preloadPosts,
    preloadComments,
    preloadBookmarks,
    preloadByCardType,
  };
}

// 통합 상태 관리 - 지연 로딩 없는 버전
export function useMyPageState() {
  const summary = useMyActivitySummary();
  const loadingState = useMyPageLoadingState();

  // 로딩 상태를 더 세분화
  const isInitialLoading = summary.isLoading && !summary.data.length;
  const isRefetching = summary.isFetching && summary.data.length > 0;

  return {
    summary,
    isInitialLoading, // 처음 로딩 (스피너 표시)
    isRefetching, // 백그라운드 갱신 (작은 인디케이터만)
    isLoading: summary.isLoading || loadingState.isAnyLoading,
    error: summary.error,
    refetch: summary.refetch,
  };
}
