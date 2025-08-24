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

// ============================================================================
// 1. 사용자 프로필 훅
// ============================================================================
export function useMyProfile() {
  return useQuery<UserProfile>({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// 2. 북마크 관련 훅들
// ============================================================================
export function useMyBookmarks(page: number = 1, pageSize: number = 5) {
  return useQuery<BookmarksResponse>({
    queryKey: ["myBookmarks", { page, pageSize }],
    queryFn: () => getMyBookmarks({ page, pageSize }),
    keepPreviousData: true, // 페이지 전환 시 이전 데이터 유지
    staleTime: 2 * 60 * 1000, // 2분간 fresh
    refetchOnWindowFocus: false,
  });
}

export function useDeleteBookmarks() {
  const queryClient = useQueryClient();
  const toast = useToastStore();

  return useMutation({
    mutationFn: deleteBookmarks,
    onSuccess: (data, variables) => {
      // 북마크 목록 캐시 무효화
      queryClient.invalidateQueries(["myBookmarks"]);
      // 활동 요약 캐시 무효화 (개수 업데이트)
      queryClient.invalidateQueries(["myActivitySummary"]);

      const count = variables.length;
      const message =
        count === 1
          ? "북마크가 삭제되었습니다"
          : `${count}개의 북마크가 삭제되었습니다`;

      toast.push({
        message,
        type: "success",
        durationMs: 3000,
      });
    },
    onError: (error) => {
      toast.push({
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
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// 4. 게시글 관련 훅
// ============================================================================
export function useMyPosts(page: number = 1, pageSize: number = 5) {
  return useQuery<PostsResponse>({
    queryKey: ["myPosts", { page, pageSize }],
    queryFn: () => getMyPosts({ page, pageSize }),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// 5. 활동 요약 훅 (메인 페이지용)
// ============================================================================
export function useMyActivitySummary() {
  return useQuery<MyPageCardData[]>({
    queryKey: ["myActivitySummary"],
    queryFn: getMyActivitySummary,
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// 6. 통합 로딩/에러 상태 관리 훅
// ============================================================================
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

// ============================================================================
// 7. 페이지네이션 헬퍼 훅
// ============================================================================
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

// ============================================================================
// 8. 에러 상태 처리 훅
// ============================================================================
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
