import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PostList from "@components/Board/free/PostList";
import type { FreeBoardItem } from "@components/Board/free/PostRow";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyMmDd, formatYyyyMmDdHms } from "@utils/date";
import { urlForPost } from "@utils/urlForPost";

import {
  profileToTagsMock,
  COHORTS,
  POSITIONS,
  type CohortLabel,
  type PositionLabel,
} from "@src/mocks/tags.mock";
import { tagsToAuthorLabel } from "@utils/tagsToAuthorLabel";

const PAGE_SIZE = 15;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "전체";

  const [items, setItems] = useState<FreeBoardItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [lastLoadedAt, setLastLoadedAt] = useState<string>(
    formatYyyyMmDdHms(new Date())
  );

  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const hasMore = useMemo(() => {
    return items.length < totalCount && items.length > 0;
  }, [items.length, totalCount]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

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
      busyRef.current = true;
      if (mountedRef.current) setBusy(true);
      setErr(null);

      try {
        await new Promise((r) => setTimeout(r, 800));

        const mockResults = generateMockSearchResults(query, category, pageNum);

        if (!mountedRef.current) return;

        if (isNewSearch) {
          setItems(mockResults.items);
          setTotalCount(mockResults.totalCount);
        } else {
          setItems((prev) => [...prev, ...mockResults.items]);
        }

        pageRef.current = pageNum;
        setLastLoadedAt(formatYyyyMmDdHms(new Date()));
      } catch (error) {
        if (mountedRef.current) {
          setErr("검색 중 오류가 발생했습니다.");
          console.error("Search error:", error);
        }
      } finally {
        if (mountedRef.current) setBusy(false);
        busyRef.current = false;
      }
    },
    []
  );

  // 검색어나 카테고리 변경 시 초기화
  useEffect(() => {
    setItems([]);
    setErr(null);
    pageRef.current = 1;
    hasMoreRef.current = true;

    if (searchQuery.trim()) {
      performSearch(searchQuery, categoryParam, 1, true);
    }
  }, [searchQuery, categoryParam, performSearch]);

  const loadMore = useCallback(async () => {
    if (!searchQuery.trim() || busyRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    await performSearch(searchQuery, categoryParam, nextPage, false);
  }, [searchQuery, categoryParam, performSearch]);

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
      // 검색 결과에서 게시판 타입 추출
      const item = items.find((item) => item.id === id);
      const itemBoardType = (item as FreeBoardItem & { boardType?: string })
        ?.boardType;

      // 유효한 게시판 타입인지 확인하고 기본값 설정
      const isValidBoardType = (type: string): type is BoardType => {
        return BOARD_TYPES.includes(type as BoardType);
      };

      const boardType: BoardType =
        itemBoardType && isValidBoardType(itemBoardType)
          ? itemBoardType
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

// 게시판 타입 정의
const BOARD_TYPES = ["free", "jobs", "info", "survey", "github"] as const;
type BoardType = (typeof BOARD_TYPES)[number];

const BOARD_NAMES = {
  free: "자유",
  jobs: "취업",
  info: "정보",
  survey: "설문",
  github: "GitHub",
} as const;

// 목업 검색 결과 생성 함수
function generateMockSearchResults(
  query: string,
  category: string,
  page: number
) {
  // 검색어가 너무 특수하거나 결과가 없을 만한 경우 처리
  const shouldHaveNoResults =
    query.length < 2 ||
    query.includes("없는검색어") ||
    query.includes("asdfqwer");

  if (shouldHaveNoResults) {
    return { items: [], totalCount: 0 };
  }

  // 카테고리에 따른 필터링
  let filteredBoardTypes: readonly BoardType[];
  if (category === "전체") {
    filteredBoardTypes = BOARD_TYPES;
  } else {
    // 카테고리명을 BoardType으로 매핑
    const categoryToBoard: Record<string, BoardType> = {
      자유: "free",
      취업: "jobs",
      정보: "info",
      설문: "survey",
      GitHub: "github",
    };
    const boardType = categoryToBoard[category];
    filteredBoardTypes = boardType ? [boardType] : BOARD_TYPES;
  }

  const totalCount = Math.floor(Math.random() * 150) + 20;
  const startIndex = (page - 1) * PAGE_SIZE;

  if (startIndex >= totalCount) {
    return { items: [], totalCount };
  }

  const itemCount = Math.min(PAGE_SIZE, totalCount - startIndex);
  const items: (FreeBoardItem & { boardType: BoardType })[] = Array.from(
    { length: itemCount },
    (_, i) => {
      const idx = startIndex + i;
      const dayOffset = Math.floor(idx / 3);
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);

      // 필터링된 게시판 타입에서만 결과 생성
      const boardType = filteredBoardTypes[idx % filteredBoardTypes.length];
      const boardName = BOARD_NAMES[boardType];

      return {
        id: `search-${query}-${boardType}-${idx}`,
        no: totalCount - idx,
        title: `[${boardName}] "${query}" 관련 게시글 ${
          idx + 1
        } - 검색 키워드가 포함된 제목`,
        author: `작성자${(idx % 10) + 1}`,
        authorId: `author${(idx % 10) + 1}`,
        dateText: formatYyMmDd(date),
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 50),
        boardType, // 게시판 정보 추가
      };
    }
  );

  return { items, totalCount };
}
