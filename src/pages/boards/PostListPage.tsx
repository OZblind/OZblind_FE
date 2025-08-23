import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostList from "@src/components/Board/free/PostList";
import type { BoardSlug } from "@src/constants/boards";
import { mapToFreeItem } from "@src/features/posts/list/adapters";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { useBoardPosts } from "@hooks/useBoardPosts";
import { LIST_SETTINGS, ERROR_MESSAGES } from "@constants/ui";
import { tagsToAuthorLabel } from "@utils/tagsToAuthorLabel";
import { adaptUserTag } from "@src/features/tags/adapters";
import type { RawUserTag } from "@api/tags";

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

  // 작성자 태그 타입가드
  const isRawUserTag = (u: unknown): u is RawUserTag =>
    typeof u === "object" &&
    u !== null &&
    typeof (u as { id?: unknown }).id === "number" &&
    (u as { tag_class?: unknown }).tag_class !== undefined &&
    typeof (u as { tag_number?: unknown }).tag_number === "number";

  // 작성자 라벨 맵: postId → "11기 · 프론트" 등
  const authorLabelMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of items) {
      const maybeUser = (p as { user?: unknown }).user;
      const tags = adaptUserTag(isRawUserTag(maybeUser) ? maybeUser : null);
      if (tags.length > 0) m.set(p.id, tagsToAuthorLabel(tags));
    }
    return m;
  }, [items]);
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
          renderAuthorLabel={(it) => authorLabelMap.get(Number(it.id)) ?? ""}
        />
      </section>
    </div>
  );
}
