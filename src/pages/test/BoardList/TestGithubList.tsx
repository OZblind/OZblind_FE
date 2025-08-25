import { useMemo, useState } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import {
  useGithubPostListMock,
  useGithubPostListItems,
  GITHUB_POSTS_MOCK_KEY,
  type GithubPostsPage,
} from "@hooks/useGithubPosts.mock";
import GithubList from "@components/Board/github/GithubList";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { useNavigate } from "react-router-dom";
import { urlForPost } from "@src/utils/urlForPost";

export default function TestGithubList() {
  const navigate = useNavigate();

  const qc = useQueryClient();
  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );
  const [forcedError, setForcedError] = useState<string | null>(null);

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
  } = useGithubPostListMock();

  // 무한스크롤 페이지 → GithubList에 맞는 items 변환
  const items = useGithubPostListItems(data);

  // 센티넬
  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "600px 0px",
    threshold: 0,
    disabled: isFetchingNextPage || !hasNextPage || !!forcedError || isError,
    onIntersect: async () => {
      await fetchNextPage();
    },
  });

  // 상단 컨트롤
  const handleRefresh = () => {
    setForcedError(null);
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    refetch();
  };

  const handleResetAll = () => {
    setForcedError(null);
    qc.removeQueries({ queryKey: GITHUB_POSTS_MOCK_KEY });
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
  };

  const handleClearItems = () => {
    const emptyData: InfiniteData<GithubPostsPage> = {
      pages: [{ items: [], hasMore: false }],
      pageParams: [0],
    };
    qc.setQueryData<InfiniteData<GithubPostsPage>>(
      GITHUB_POSTS_MOCK_KEY,
      emptyData
    );
    setForcedError(null);
  };

  const handleToggleError = () => {
    setForcedError((e) => (e ? null : "의도적 테스트 에러"));
  };

  // 상단 디버그 라벨
  const debugText = useMemo(() => {
    const total = items.length;
    return `hasMore: ${String(!!hasNextPage)} / busy: ${String(
      isFetchingNextPage
    )} / items: ${total}`;
  }, [hasNextPage, isFetchingNextPage, items.length]);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">
          GitHub 레포 게시글 리스트 — UI 테스트
        </h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={handleResetAll}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            초기화(캐시 제거)
          </button>
          <button
            onClick={handleClearItems}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            비우기(Empty)
          </button>
          <button
            onClick={handleToggleError}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            에러 상태 토글
          </button>
          <button
            onClick={handleRefresh}
            className="rounded-md border px-3 py-1 hover:bg-base-200"
          >
            새로고침
          </button>
        </div>
      </header>

      {/* ❗️ 본문 내 스크롤 적용 시 부모(wrapper)엔 높이가 있어야 함 ❗️ */}
      <section className="rounded-xl border p-3 pb-8 h-[calc(100vh-100px)] overflow-hidden">
        <div className="text-xs opacity-70 mb-2">
          {debugText}
          {(isError || !!forcedError) && (
            <span className="ml-2 text-red-500">
              | error: {forcedError ?? (error as Error)?.message ?? "에러"}
            </span>
          )}
        </div>

        <GithubList
          items={items}
          onItemClick={(id) => navigate(urlForPost.postDetail(id))}
          topBar={{
            boardName: "GitHub 게시판",
            onOpenSort: () => console.log("정렬 필터 열기"),
            onOpenTag: () => console.log("태그 필터 열기"),
            onWrite: () => navigate(urlForPost.postCreate("github")),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={isFetchingNextPage}
          isError={!!forcedError || isError}
          errorText={forcedError ?? (error as Error)?.message}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
        />
      </section>
    </div>
  );
}
