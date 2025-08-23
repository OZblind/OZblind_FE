// src/pages/boards/SearchPage.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PostList from "@components/Board/free/PostList";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyMmDd, formatYyyyMmDdHms } from "@utils/date";
import { urlForPost } from "@utils/urlForPost";
import { searchFullResultsApi } from "@src/api/searchApi";
import type { Post, Category } from "@src/types/search";

import {
  profileToTagsMock,
  COHORTS,
  POSITIONS,
  type CohortLabel,
  type PositionLabel,
} from "@src/mocks/tags.mock";
import { tagsToAuthorLabel } from "@utils/tagsToAuthorLabel";

const PAGE_SIZE = 15;

// 게시판 타입 정의
const BOARD_TYPES = ["free", "jobs", "info", "survey", "github"] as const;
type BoardType = (typeof BOARD_TYPES)[number];

// 카테고리명을 게시판 슬러그로 변환
const getCategoryBoardType = (category: string): BoardType => {
  const categoryMap: Record<string, BoardType> = {
    자유: "free",
    취업: "jobs",
    정보: "info",
    설문: "survey",
    GitHub: "github",
  };
  return categoryMap[category] || "free";
};

// Post를 FreeBoardItem으로 변환하는 함수
const transformPostToFreeBoardItem = (
  post: Post,
  index: number
): FreeBoardItem & { category: string } => {
  return {
    id: String(post.id),
    no: index + 1,
    title: post.title,
    author: post.author,
    authorId: `author${post.id}`,
    dateText: formatYyMmDd(new Date(post.createdAt)),
    views: post.viewCount,
    likes: 0,
    category: post.category, // 카테고리 정보 보존
  };
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "전체";

  const [items, setItems] = useState<(FreeBoardItem & { category: string })[]>(
    []
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [lastLoadedAt, setLastLoadedAt] = useState<string>(
    formatYyyyMmDdHms(new Date())
  );

  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const pageRef = useRef(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const hasMore = useMemo(() => {
    return hasNext;
  }, [hasNext]);

  // 글쓴이 label 만들기 (FreeBoard와 동일한 로직)
  const authorLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    const cohorts = COHORTS as readonly CohortLabel[];
    const positions = POSITIONS as readonly PositionLabel[];

    items.forEach((it, idx) => {
      // authorId가 있으면 그 숫자 기반으로, 없으면 idx 기반으로 생성
      const base = Number(/\d+/.exec(it.authorId ?? "")?.[0] ?? idx);
      const cohort = cohorts[(base + 1) % cohorts.length];
      const position = positions[base % positions.length];

      // 목 태그 → "프론트엔드 11기" 라벨로 변환
      const tags = profileToTagsMock(cohort, position);
      m.set(it.authorId ?? String(it.author), tagsToAuthorLabel(tags));
    });

    return m;
  }, [items]);

  // 검색 실행
  const performSearch = useCallback(
    async (
      query: string,
      category: string,
      pageNum: number,
      isNewSearch: boolean = false
    ) => {
      if (busyRef.current) return;

      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      busyRef.current = true;
      if (mountedRef.current) setBusy(true);
      setErr(null);

      try {
        const result = await searchFullResultsApi(
          query,
          category as Category,
          pageNum,
          PAGE_SIZE,
          abortControllerRef.current.signal
        );

        if (!mountedRef.current) return;

        // Post[] → FreeBoardItem[] 변환
        const transformedItems = result.posts.map((post, idx) =>
          transformPostToFreeBoardItem(post, (pageNum - 1) * PAGE_SIZE + idx)
        );

        if (isNewSearch) {
          setItems(transformedItems);
          setTotalCount(result.totalCount);
        } else {
          setItems((prev) => [...prev, ...transformedItems]);
        }

        setHasNext(result.hasNext);
        pageRef.current = pageNum;
        setLastLoadedAt(formatYyyyMmDdHms(new Date()));
      } catch (error) {
        // AbortError는 무시
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (mountedRef.current) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "검색 중 오류가 발생했습니다.";
          setErr(errorMessage);
          console.error("Search error:", error);
        }
      } finally {
        if (mountedRef.current) setBusy(false);
        busyRef.current = false;
        abortControllerRef.current = null;
      }
    },
    []
  );

  // 검색어나 카테고리 변경 시 초기화
  useEffect(() => {
    setItems([]);
    setErr(null);
    setHasNext(false);
    pageRef.current = 1;

    if (searchQuery.trim()) {
      performSearch(searchQuery, categoryParam, 1, true);
    }
  }, [searchQuery, categoryParam, performSearch]);

  const loadMore = useCallback(async () => {
    if (!searchQuery.trim() || busyRef.current || !hasNext) return;
    const nextPage = pageRef.current + 1;
    await performSearch(searchQuery, categoryParam, nextPage, false);
  }, [searchQuery, categoryParam, performSearch, hasNext]);

  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "400px 0px",
    threshold: 0,
    disabled: busy || !hasMore || !!err || !searchQuery.trim(),
    onIntersect: async () => {
      await loadMore();
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    },
  });

  const handleRefresh = useCallback(() => {
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    if (searchQuery.trim()) {
      performSearch(searchQuery, categoryParam, 1, true);
    }
  }, [searchQuery, categoryParam, performSearch]);

  const goDetail = useCallback(
    (id: FreeBoardItem["id"]) => {
      // 아이템에서 카테고리 정보 추출
      const item = items.find((item) => item.id === id);
      const boardType = item?.category
        ? getCategoryBoardType(item.category)
        : "free";
      navigate(urlForPost.postDetail(boardType, id));
    },
    [navigate, items]
  );

  const isInitialLoading = items.length === 0 && busy;
  const listIsLoading = isInitialLoading || busy;

  return (
    <div className="w-full p-4 max-w-5xl mx-auto space-y-4">
      {/* 검색 정보 표시 - 검색어가 있을 때만 */}
      {searchQuery.trim() && (
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">검색어:</span> "{searchQuery}"
              {categoryParam !== "전체" && (
                <span className="ml-4">
                  <span className="font-medium">카테고리:</span> {categoryParam}
                </span>
              )}
            </div>
            {!busy && items.length > 0 && (
              <span className="text-sm text-base-content/60">
                총 {totalCount.toLocaleString()}건
              </span>
            )}
          </div>
        </div>
      )}

      {/* 검색 결과 리스트 */}
      <section className="w-full rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-hidden">
        <PostList
          items={items}
          onItemClick={goDetail}
          topBar={{
            boardName: `통합 검색 결과`,
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={listIsLoading}
          isError={!!err}
          errorText={err ?? undefined}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          empty={{
            message: searchQuery.trim()
              ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
              : "검색어 없음",
            ...(searchQuery.trim() && {
              actionLabel: "새로고침",
              onAction: handleRefresh,
            }),
            icon: (
              <svg
                className="w-12 h-12 text-base-content/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            ),
          }}
          renderAuthorLabel={(it) =>
            authorLabelMap.get(it.authorId ?? String(it.author)) ?? it.author
          }
        />
      </section>
    </div>
  );
}
