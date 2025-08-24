import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import PostRow, { FREE_LIST_GRID } from "@components/Board/free/PostRow";
import PostCard from "@components/Board/free/PostCard";
import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import EmptyState from "@components/Board/common/EmptyState";
import { LastLoadedBar } from "@components/Board/common";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyMmDd, formatYyyyMmDdHms } from "@utils/date";
import { urlForPost } from "@utils/urlForPost";
import { searchFullResultsApi } from "@src/api/searchApi";
import type { Post, Category } from "@src/types/search";
import { tagsToAuthorLabel } from "@utils/tagsToAuthorLabel";
import { ERROR_MESSAGES, LIST_MESSAGES, LOADING_MESSAGES } from "@constants/ui";
import type { RawUserTag } from "@src/types/tag";
import { adaptUserTag } from "@src/features/tags/adapters";

const PAGE_SIZE = 15;

// 게시판 타입 정의
type BoardType = "free" | "jobs" | "info" | "survey" | "github";

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

const isRawUserTag = (u: unknown): u is RawUserTag =>
  typeof u === "object" &&
  u !== null &&
  "id" in u &&
  "tag_class" in u &&
  "tag_number" in u;

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
    user: post.user,
  };
};

// 검색 결과 전용 컴포넌트
function SearchResultList({
  items,
  onItemClick,
  boardName,
  lastLoadedAt,
  onRefresh,
  isLoading,
  isError,
  errorText,
  hasMore,
  sentinelRef,
  scrollRootRef,
  renderAuthorLabel,
}: {
  items: (FreeBoardItem & { category: string })[];
  onItemClick?: (id: FreeBoardItem["id"]) => void;
  boardName: string;
  lastLoadedAt?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  errorText?: string;
  hasMore?: boolean;
  sentinelRef?: (el: HTMLDivElement | null) => void;
  scrollRootRef?: (el: HTMLDivElement | null) => void;
  renderAuthorLabel?: (item: FreeBoardItem) => React.ReactNode;
}) {
  const isEmpty = items.length === 0;

  return (
    <section className="flex h-full flex-col">
      {/* 검색 결과 헤더 (버튼 없음) */}
      <div className="mb-2 px-3 flex-none">
        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex-1 min-w-0 truncate pr-2 text-base font-semibold leading-tight">
              {boardName}
            </h2>
          </div>
          <div className="mt-0.5">
            <LastLoadedBar
              lastLoadedAt={lastLoadedAt}
              onRefresh={onRefresh}
              compact
              iconOnly
            />
          </div>
        </div>
      </div>

      {/* 본문 스크롤 컨테이너 */}
      <div
        ref={scrollRootRef}
        className="w-full px-3 flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
      >
        {isError && (
          <div className="w-full py-10 text-center text-sm text-red-500">
            {errorText ?? ERROR_MESSAGES.GENERAL}
          </div>
        )}

        {!isError && isLoading && isEmpty && (
          <div className="w-full py-6 text-center text-sm">
            {LOADING_MESSAGES.POSTS}
          </div>
        )}

        {!isError && !isLoading && isEmpty && (
          <div className="w-full py-6">
            <EmptyState
              message="검색 결과가 없습니다."
              icon={
                <svg
                  className="w-12 h-12 text-base-content/40"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              }
            />
          </div>
        )}

        {!isError && !(isLoading && isEmpty) && !isEmpty && (
          <>
            {/* 데스크톱(테이블) */}
            <div className="hidden md:block">
              <div
                className={`${FREE_LIST_GRID} gap-2 py-2 text-xs font-medium text-base-content/60 sticky top-0 z-10 bg-base-100 border-b border-base-300`}
              >
                <div className="text-center">번호</div>
                <div className="text-center">제목</div>
                <div className="text-center">글쓴이</div>
                <div className="text-center">등록일</div>
                <div className="text-center">조회</div>
                <div className="text-center">추천</div>
              </div>

              <ul className="divide-y divide-base-300">
                {items.map((it) => {
                  return (
                    <li key={String(it.id)}>
                      <PostRow
                        item={it}
                        onClick={onItemClick}
                        authorLabel={renderAuthorLabel?.(it)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 모바일(카드) */}
            <div className="md:hidden">
              <ul className="space-y-2 max-[360px]:space-y-1.5">
                {items.map((it) => (
                  <li key={String(it.id)}>
                    <PostCard
                      item={it}
                      onClick={onItemClick}
                      authorLabel={renderAuthorLabel?.(it)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* 센티넬 */}
            <div className="mt-2">
              {hasMore !== false && <ScrollSentinel innerRef={sentinelRef} />}
            </div>

            {isLoading && items.length > 0 && (
              <div
                className="py-3 text-center text-xs opacity-70"
                aria-live="polite"
                role="status"
              >
                {LOADING_MESSAGES.POSTS}
              </div>
            )}

            {!isLoading && hasMore === false && (
              <div className="py-6 text-center text-xs text-base-content/60">
                {LIST_MESSAGES.NO_MORE}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

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
  const [totalCount, setTotalCount] = useState<number>(0);
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

  // 글쓴이 label 만들기
  const authorLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const item of items) {
      const maybeUser = item.user;
      const tags = adaptUserTag(isRawUserTag(maybeUser) ? maybeUser : null);
      if (tags.length > 0) {
        const authorLabel = tagsToAuthorLabel(tags);
        m.set(String(item.id), authorLabel);
      } else {
        m.set(String(item.id), item.author);
      }
    }
    return m;
  }, [items]);
  const memoizedRenderAuthorLabel = useCallback(
    (it: FreeBoardItem) => {
      const label = authorLabelMap.get(String(it.id));
      return label ?? it.author;
    },
    [authorLabelMap]
  );
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

  const boardName = searchQuery.trim()
    ? `"${searchQuery}" 검색 결과${
        categoryParam !== "전체" ? ` (${categoryParam})` : ""
      }${
        !busy && items.length > 0 && searchQuery.trim()
          ? ` (총 ${Number(totalCount).toLocaleString()}건)`
          : ""
      }`
    : `통합 검색 결과`;

  return (
    <div className="w-full p-4 max-w-5xl mx-auto">
      {/* 검색 결과 리스트 */}
      <section className="w-full rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-hidden">
        <SearchResultList
          items={items}
          onItemClick={goDetail}
          boardName={boardName}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={listIsLoading}
          isError={!!err}
          errorText={err ?? undefined}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          renderAuthorLabel={memoizedRenderAuthorLabel}
        />
      </section>
    </div>
  );
}
