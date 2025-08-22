import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostList from "@src/components/Board/free/PostList";
import type { BoardSlug } from "@src/constants/boards";
import { mapToFreeItem } from "@src/features/posts/list/adapters";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { useBoardPosts } from "@hooks/useBoardPosts";
import { LIST_SETTINGS, ERROR_MESSAGES } from "@constants/ui";

// ---------------------------------------------------------------------
// (태그 라벨) 지금은 플레이스홀더 — 추후 DB/서버 태그로 교체 예정
// TODO(tags): 아래 mock import는 나중에 제거하고, 배치 API(getAssignedTagsBulk 등)로 교체
import { tagsToAuthorLabel } from "@utils/tagsToAuthorLabel";
import { profileToTagsMock } from "@src/mocks/tags.mock";
// ---------------------------------------------------------------------

const BOARD_LABEL: Record<BoardSlug, string> = {
  free: "자유 게시판",
  jobs: "취업 게시판",
  info: "정보 게시판",
  survey: "설문 게시판",
  github: "GitHub 게시판",
};

export default function PostListPage({ board }: { board: BoardSlug }) {
  const nav = useNavigate();
  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    refetch,
  } = useBoardPosts(board, {
    pageSize: LIST_SETTINGS.ITEMS_PER_PAGE,
    sort: "latest", // TODO(sort): UI 정렬 상태와 연결 (또는 ordering 직접 지정)
    // ordering: "-created_at",
    // search,                // TODO(filter): 검색어 연결
    // tags: [...],           // TODO(filter): 태그 필터 연결
  });

  // pages(flat) → PostListItem[]
  const items = useMemo(() => (data?.pages ?? []).flat(), [data]);

  // API 응답 → UI 아이템(FreeBoardItem)으로 변환
  const uiItems = useMemo(() => items.map(mapToFreeItem), [items]);

  // 초기 로딩/Empty 깜빡임 방지
  const hasNoPages = uiItems.length === 0;
  const isInitialLoading = hasNoPages && isFetching;
  const listIsLoading = isInitialLoading || isFetchingNextPage;

  // 무한 스크롤
  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "400px 0px",
    threshold: 0,
    disabled: listIsLoading || !hasNextPage || isError,
    onIntersect: async () => {
      await fetchNextPage();
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    },
  });

  // ---------------------------------------------------------------------
  // [임시] 모든 글을 "프론트 11기"로 표시하는 플레이스홀더 라벨
  // TODO: 실서비스 연결 시, 이 블록 전체를 배치 API(getAssignedTagsBulk)로 교체
  // ---------------------------------------------------------------------
  const PLACEHOLDER_LABEL = useMemo(
    () => tagsToAuthorLabel(profileToTagsMock("11기", "프론트")),
    []
  );

  const authorLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    // 모든 아이템을 동일한 placeholder 라벨로 세팅
    uiItems.forEach((it) => {
      const key = it.authorId
        ? String(it.authorId)
        : `${board}:${it.id ?? "unknown"}`;
      m.set(key, PLACEHOLDER_LABEL);
    });
    return m;
  }, [uiItems, board, PLACEHOLDER_LABEL]);
  // ---------------------------------------------------------------------

  const handleRefresh = useCallback(() => {
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    refetch(); // infiniteQuery 캐시 유지한 채 재요청
  }, [refetch]);

  const errorText =
    isError && error && typeof error === "object" && "message" in error
      ? (error as { message?: string }).message
      : ERROR_MESSAGES.LOAD_POSTS;

  return (
    <div className="self-stretch w-[800px] max-w-full p-4">
      <section className="w-full rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-hidden">
        <PostList
          items={uiItems}
          onItemClick={(id) => nav(`/posts/${id}`)}
          topBar={{
            boardName: BOARD_LABEL[board],
            onWrite: () => nav(`/write?board=${board}`),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={listIsLoading}
          isError={isError}
          errorText={isError ? errorText : undefined}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          empty={{ message: "등록된 게시글이 없습니다." }}
          className="py-2"
          // 지금은 전부 "프론트 11기"를 표시(placeholder).
          // TODO: 실서비스 연결 시, 아래 내부를 authorLabelMap.get(authorId) 기반으로 바꾸면 됨.
          renderAuthorLabel={(it) => {
            const key = it.authorId ? String(it.authorId) : `${board}:${it.id}`;
            return authorLabelMap.get(key) ?? PLACEHOLDER_LABEL;
          }}
        />
      </section>
    </div>
  );
}
