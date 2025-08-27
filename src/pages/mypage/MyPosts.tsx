/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@src/components/commons/MyPage/PageHeader";
import Pagination from "@src/components/commons/MyPage/Pagination";
import {
  ANIMATION_TIMINGS,
  ANIMATION_CLASSES,
  getDurationClass,
  SlideInStyles,
} from "@constants/animations";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  EMPTY_MESSAGES,
  BUTTON_TEXT,
  LIST_SETTINGS,
} from "@src/constants/ui";
import { safeParseInt, safeString } from "@src/utils/errorUtils";
import {
  useMyPosts,
  useMyPageLoadingState,
  useMyPageError,
  useMyActivitySummary,
} from "@src/hooks/useMyPageData";
import type { PostItem } from "@src/types/mypage";
import { PATHS } from "@constants/paths";
import { fetchMyPosts } from "@src/api/mypageApi";
// 🔹 다음 페이지 채우기용(백그라운드 프리패치): 목록 API 직접 호출

type RawPost = any;

function parseDateLike(v: any): number {
  if (!v) return 0;
  const d = new Date(v as string);
  return isNaN(+d) ? 0 : +d;
}
function byNewerFirst(a: any, b: any) {
  const ta =
    parseDateLike(a?.created_at ?? a?.createdAt ?? a?.created ?? a?.date) ||
    Number(a?.id ?? a?.postId ?? 0);
  const tb =
    parseDateLike(b?.created_at ?? b?.createdAt ?? b?.created ?? b?.date) ||
    Number(b?.id ?? b?.postId ?? 0);
  return tb - ta;
}
function getId(p: any): string {
  const v = p?.id ?? p?.postId;
  return v === undefined || v === null ? "" : String(v);
}

interface PostListItemProps {
  post: PostItem;
  onClick?: () => void;
  index?: number;
  isExiting?: boolean;
}

const PostListItem: React.FC<PostListItemProps> = ({
  post,
  onClick,
  index = 0,
  isExiting = false,
}) => {
  const safePost = {
    id: safeParseInt((post as any)?.id ?? (post as any)?.postId, 0),
    category: safeString((post as any)?.category, "일반"),
    title: safeString((post as any)?.title, "제목 없음"),
    date: safeString((post as any)?.date, ""),
  };

  const safeIndex = Math.max(0, safeParseInt(index, 0));

  return (
    <div
      className={`flex items-center py-4 px-2 border-b border-base-300 hover:bg-base-200 cursor-pointer transition-all duration-500 transform opacity-0 translate-x-8 animate-slide-in`}
      style={{
        transitionDelay: `${safeIndex * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
        animationDelay: `${safeIndex * ANIMATION_TIMINGS.ITEM_STAGGER_BASE}ms`,
      }}
      onClick={() => !isExiting && onClick && onClick()}
    >
      <div className="w-16 flex-shrink-0">
        <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded">
          {safePost.category}
        </span>
      </div>
      <div className="flex-1 px-4">
        <h3
          className={`text-base-content hover:text-primary transition-colors ${getDurationClass(
            ANIMATION_TIMINGS.HOVER_TRANSITION
          )} line-clamp-1`}
        >
          {safePost.title}
        </h3>
      </div>
      <div className="w-20 sm:w-24 text-right text-xs sm:text-sm text-neutral-content">
        {safePost.date}
      </div>
    </div>
  );
};

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = LIST_SETTINGS.ITEMS_PER_PAGE; // 10/페이지
  const timeoutRef = useRef<number | null>(null);

  // ① 현재 페이지 데이터 (서버)
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsErrorMessage,
    refetch: refetchPosts,
  } = useMyPosts(currentPage, pageSize);

  // ② 요약 카드에서 전체 개수 폴백
  const { data: summaryCards } = useMyActivitySummary();
  const postsTotalFromSummary = useMemo(() => {
    if (!Array.isArray(summaryCards)) return undefined;
    const hit = (
      summaryCards as Array<{ title?: string; count?: number }>
    ).find((c) => c?.title === "작성글");
    return Number.isFinite(hit?.count as number)
      ? Number(hit?.count)
      : undefined;
  }, [summaryCards]);

  const { isAnyLoading } = useMyPageLoadingState();

  // ③ 페이지 캐시: 1..N 페이지를 모아 정렬/중복제거 후 현재 페이지 구간만 슬라이스
  const [pageCache, setPageCache] = useState<Record<number, RawPost[]>>({});
  const [knownTotalPages, setKnownTotalPages] = useState<number | undefined>(
    undefined
  );
  const [isPrefetching, setIsPrefetching] = useState(false);

  // 현재 페이지 데이터가 도착하면 캐시에 적재
  const rawItems = postsData?.data ?? [];
  useEffect(() => {
    if (!Array.isArray(rawItems)) return;
    setPageCache((prev) => {
      // 이미 동일 페이지가 있고 내용이 같으면 그대로
      const same =
        prev[currentPage]?.length === rawItems.length &&
        prev[currentPage]?.every((it, i) => getId(it) === getId(rawItems[i]));
      if (same) return prev;
      return { ...prev, [currentPage]: rawItems };
    });

    // 서버가 totalPages를 알려주면 보관(없으면 그대로)
    const apiTotalPages = Number.isFinite(postsData?.pagination?.totalPages)
      ? Number(postsData?.pagination?.totalPages)
      : undefined;
    if (apiTotalPages) {
      setKnownTotalPages((prev) =>
        typeof prev === "number" ? Math.max(prev, apiTotalPages) : apiTotalPages
      );
    }
  }, [currentPage, JSON.stringify(rawItems)]);

  // 캐시 → 평탄화 → 중복제거 → 최신순
  const stitchedList: RawPost[] = useMemo(() => {
    const pages = Object.keys(pageCache)
      .map((k) => Number(k))
      .sort((a, b) => a - b);
    const flat: RawPost[] = [];
    for (const p of pages) {
      const arr = pageCache[p] ?? [];
      for (const it of arr) flat.push(it);
    }
    const seen = new Set<string>();
    const uniq: RawPost[] = [];
    for (const it of flat) {
      const id = getId(it);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      uniq.push(it);
    }
    return uniq.sort(byNewerFirst);
  }, [pageCache]);

  // 총합 안정화(요약/서버/집계 중 최대값)
  const computedTotal = useMemo(() => {
    const candidates = [postsTotalFromSummary, stitchedList.length].filter(
      (n): n is number => typeof n === "number" && n >= 0
    );
    return candidates.length ? Math.max(...candidates) : 0;
  }, [postsTotalFromSummary, stitchedList.length]);

  // 표시값은 단조 증가만 허용(깜빡임/축소 방지). API의 pageSize 배수로 '갑툭튀'하는 일 없음
  const [stableTotalItems, setStableTotalItems] =
    useState<number>(computedTotal);
  useEffect(() => {
    setStableTotalItems((prev) =>
      typeof prev === "number" ? Math.max(prev, computedTotal) : computedTotal
    );
  }, [computedTotal]);

  const totalItems = stableTotalItems;

  // 현재 페이지 구간 슬라이스(스티치 결과 기준)
  const offset = (currentPage - 1) * pageSize;
  const pageSlice = stitchedList.slice(offset, offset + pageSize);

  // 필요 시 다음 페이지를 1회 프리패치해서 빈 칸 채우기
  useEffect(() => {
    const needFill =
      pageSlice.length < pageSize &&
      stitchedList.length < currentPage * pageSize &&
      (totalItems > stitchedList.length ||
        (knownTotalPages || 0) > Object.keys(pageCache).length);

    if (!needFill || isPrefetching) return;
    // 다음 페이지 번호 추정: 캐시에 없는 가장 작은 번호
    const loadedPages = Object.keys(pageCache)
      .map((k) => Number(k))
      .sort((a, b) => a - b);
    const nextPage =
      loadedPages.length === 0 ? 1 : Math.max(...loadedPages) + 1;

    if (
      nextPage <= currentPage ||
      (knownTotalPages && nextPage > knownTotalPages)
    )
      return;

    let cancelled = false;
    (async () => {
      try {
        setIsPrefetching(true);
        const res = await fetchMyPosts({
          page: nextPage,
          pageSize,
        }); // /api/posts/?page=.. 형태 (백엔드가 허용하는 ordering이 있으면 내부에서 추가)
        if (cancelled) return;
        const data = Array.isArray(res?.data) ? res.data : [];
        setPageCache((prev) => ({ ...prev, [nextPage]: data }));
        // totalPages 힌트 반영
        const apiTP =
          typeof res?.pagination?.totalPages === "number"
            ? res.pagination.totalPages
            : undefined;
        if (apiTP) {
          setKnownTotalPages((prev) =>
            typeof prev === "number" ? Math.max(prev, apiTP) : apiTP
          );
        }
      } catch {
        // 무시 (다음 렌더에서 다시 판단)
      } finally {
        if (!cancelled) setIsPrefetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    pageSlice.length,
    stitchedList.length,
    totalItems,
    currentPage,
    pageCache,
    knownTotalPages,
    isPrefetching,
  ]);

  // 에러 처리
  const { hasError, errorMessage, retry } = useMyPageError(
    postsErrorMessage,
    refetchPosts
  );

  // 마운트 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 페이지 바뀌면 서버 호출 (기존 훅 유지)
  useEffect(() => {
    if (typeof refetchPosts === "function") refetchPosts();
  }, [currentPage, refetchPosts]);

  const handleBackClick = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsExiting(true);
    timeoutRef.current = window.setTimeout(() => {
      navigate(PATHS.MYPAGE);
      timeoutRef.current = null;
    }, ANIMATION_TIMINGS.PAGE_TRANSITION);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handlePostClick = (rawId?: number | string) => {
    const pid = safeParseInt(rawId, 0);
    if (!pid) return;
    navigate(PATHS.POST_DETAIL.replace(":id", String(pid)));
  };

  const handlePageChange = (nextPage: number) => {
    const np = safeParseInt(nextPage, 1);
    if (!np || np === currentPage) return;
    setIsExiting(true);
    window.setTimeout(() => {
      setCurrentPage(np);
      setIsExiting(false);
    }, ANIMATION_TIMINGS.ITEM_STAGGER_BASE);
  };

  // 로딩 플래그(초기/전환/프리패치 고려)
  const showLoading =
    (postsLoading || isAnyLoading) &&
    !(pageSlice.length > 0 || stitchedList.length > 0);

  return (
    <>
      <div
        className={`p-4 sm:p-6 transition-all ${getDurationClass(
          ANIMATION_TIMINGS.ITEM_APPEAR
        )} transform ${
          isLoaded && !isExiting
            ? ANIMATION_CLASSES.PAGE_ENTER
            : isExiting
            ? ANIMATION_CLASSES.PAGE_EXIT
            : ANIMATION_CLASSES.PAGE_INITIAL
        }`}
      >
        <PageHeader
          title="작성글"
          count={totalItems}
          onBackClick={handleBackClick}
          isExiting={isExiting}
          isLoading={showLoading}
          hasError={hasError}
        />

        <div
          className={`bg-base-200 rounded-lg overflow-hidden transition-all ${getDurationClass(
            ANIMATION_TIMINGS.ITEM_APPEAR
          )} ${
            isExiting
              ? ANIMATION_CLASSES.CONTAINER_EXIT
              : ANIMATION_CLASSES.CONTAINER_ENTER
          }`}
        >
          {showLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-primary loading-lg"></span>
              <p className="text-neutral-content text-sm mt-4">
                {LOADING_MESSAGES.POSTS}
              </p>
            </div>
          )}

          {hasError && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-base-content mb-2">
                {ERROR_MESSAGES.GENERAL}
              </h3>
              <p className="text-neutral-content text-sm mb-6 max-w-md mx-auto">
                {errorMessage}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBackClick}
                  className={`border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                    ANIMATION_TIMINGS.HOVER_TRANSITION
                  )}`}
                >
                  {BUTTON_TEXT.BACK}
                </button>
                <button
                  onClick={retry}
                  className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                    ANIMATION_TIMINGS.HOVER_TRANSITION
                  )}`}
                >
                  {BUTTON_TEXT.RETRY}
                </button>
              </div>
            </div>
          )}

          {!showLoading && !hasError && (
            <>
              {pageSlice.length > 0 ? (
                pageSlice.map((post: any, index: number) => {
                  const pid = (post?.postId ?? post?.id) as number | string;
                  return (
                    <PostListItem
                      key={String(post?.id ?? post?.postId ?? index)}
                      post={post}
                      onClick={() => handlePostClick(pid)}
                      index={index}
                      isExiting={isExiting}
                    />
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="text-neutral-content text-4xl mb-4">📝</div>
                  <h3 className="text-neutral-content text-lg font-medium mb-2">
                    {EMPTY_MESSAGES.POSTS}
                  </h3>
                  <p className="text-neutral-content text-sm mb-6">
                    첫 번째 글을 작성해보세요!
                  </p>
                  <button
                    onClick={() => navigate(PATHS.POST_CREATE)}
                    className={`bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors ${getDurationClass(
                      ANIMATION_TIMINGS.HOVER_TRANSITION
                    )}`}
                  >
                    {BUTTON_TEXT.WRITE}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(totalItems / pageSize))}
            onPageChange={handlePageChange}
            isLoaded={isLoaded}
            isExiting={isExiting}
          />
        )}
      </div>

      <SlideInStyles />
    </>
  );
};

export default MyPosts;
