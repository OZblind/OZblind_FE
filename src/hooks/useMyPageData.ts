import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@src/store/toastStore";
import {
  getMyProfile,
  getMyBookmarks,
  getMyComments,
  getMyPosts,
  getMyActivitySummary,
  deleteBookmarks,
} from "@api/mypageApi";
import type {
  UserProfile,
  BookmarksResponse,
  CommentsResponse,
  PostsResponse,
  MyPageCardData,
} from "@src/types/mypage";

export function useMyProfile() {
  return useQuery<UserProfile>({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000, // cacheTime → gcTime으로 변경
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useMyBookmarks(page: number = 1, pageSize: number = 5) {
  return useQuery<BookmarksResponse>({
    queryKey: ["myBookmarks", { page, pageSize }],
    queryFn: () => getMyBookmarks({ page, pageSize }),
    placeholderData: (previousData) => previousData, // keepPreviousData → placeholderData로 변경
    staleTime: 2 * 60 * 1000, // 2분간 fresh
    refetchOnWindowFocus: false,
  });
}

export function useDeleteBookmarks() {
  const queryClient = useQueryClient();
  const { push } = useToastStore();

  return useMutation({
    mutationFn: deleteBookmarks,
    onSuccess: (_data, variables) => {
      // data → _data로 변경
      // 북마크 목록 캐시 무효화 - v5 문법
      void queryClient.invalidateQueries({
        queryKey: ["myBookmarks"],
      });
      // 활동 요약 캐시 무효화 (개수 업데이트)
      void queryClient.invalidateQueries({
        queryKey: ["myActivitySummary"],
      });

      const count = variables.length;
      const message =
        count === 1
          ? "북마크가 삭제되었습니다"
          : `${count}개의 북마크가 삭제되었습니다`;

      push({
        message,
        type: "success",
        durationMs: 3000,
      });
    },
    onError: (error) => {
      const { push } = useToastStore.getState();
      push({
        message: error instanceof Error ? error.message : "삭제에 실패했습니다",
        type: "error",
        durationMs: 3000,
      });
    },
  });
}

// ============================================================================
// 3. 댓글 관련 훅
// ============================================================================
export function useMyComments(page: number = 1, pageSize: number = 5) {
  return useQuery<CommentsResponse>({
    queryKey: ["myComments", { page, pageSize }],
    queryFn: () => getMyComments({ page, pageSize }),
    placeholderData: (previousData) => previousData, // keepPreviousData → placeholderData로 변경
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useMyPosts(page: number = 1, pageSize: number = 5) {
  return useQuery<PostsResponse>({
    queryKey: ["myPosts", { page, pageSize }],
    queryFn: () => getMyPosts({ page, pageSize }),
    placeholderData: (previousData) => previousData, // keepPreviousData → placeholderData로 변경
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useMyActivitySummary() {
  return useQuery<MyPageCardData[]>({
    queryKey: ["myActivitySummary"],
    queryFn: getMyActivitySummary,
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000, // cacheTime → gcTime으로 변경
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useMyPageLoadingState() {
  // 여러 쿼리의 로딩 상태를 통합 관리
  const { isLoading: profileLoading } = useMyProfile();
  const { isLoading: activityLoading } = useMyActivitySummary();

  return {
    isAnyLoading: profileLoading || activityLoading,
    profileLoading,
    activityLoading,
  };
}

export function useMyPagePagination(
  data: BookmarksResponse | CommentsResponse | PostsResponse | undefined,
  currentPage: number,
  onPageChange: (page: number) => void
) {
  const pagination = data?.pagination;

  return {
    currentPage,
    totalPages: pagination?.totalPages || 1,
    totalItems: pagination?.totalItems || 0,
    itemsPerPage: pagination?.itemsPerPage || 5,
    hasNextPage: currentPage < (pagination?.totalPages || 1),
    hasPrevPage: currentPage > 1,
    onPageChange,
    // 페이지 범위 계산 (1, 2, 3, 4, 5 형태)
    getPageNumbers: (maxVisible: number = 5) => {
      const total = pagination?.totalPages || 1;
      if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(total, start + maxVisible - 1);
      const actualStart = Math.max(1, end - maxVisible + 1);

      return Array.from(
        { length: end - actualStart + 1 },
        (_, i) => actualStart + i
      );
    },
  };
}

export function useMyPageError(error: Error | null, retry?: () => void) {
  const getErrorMessage = (error: Error | null): string => {
    if (!error) return "";

    // 네트워크 에러 체크
    if (error.message.includes("Network")) {
      return "네트워크 연결을 확인해주세요";
    }

    // 인증 에러 체크
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      return "로그인이 필요합니다";
    }

    // 서버 에러 체크
    if (error.message.includes("500")) {
      return "서버에서 문제가 발생했습니다";
    }

    return error.message || "알 수 없는 오류가 발생했습니다";
  };

  return {
    hasError: !!error,
    errorMessage: getErrorMessage(error),
    retry,
    isNetworkError: error?.message.includes("Network") || false,
    isAuthError:
      error?.message.includes("401") ||
      error?.message.includes("Unauthorized") ||
      false,
    isServerError: error?.message.includes("500") || false,
  };
}
