import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import {
  EmptyState,
  type EmptyStateProps,
} from "@components/Board/common/EmptyState";
import { LastLoadedBar } from "@components/Board/common/LastLoadedBar";
import { PostRow, type FreeBoardItem, FREE_LIST_GRID } from "./PostRow";
import { PostCard } from "./PostCard";
import { BoardTopBar } from "@components/Board/common/BoardTopBar";

export type PostListProps = {
  items: FreeBoardItem[];
  onItemClick?: (id: FreeBoardItem["id"]) => void;

  topBar?: {
    boardName: string;
    onOpenSort?: () => void;
    onOpenTag?: () => void;
    onWrite?: () => void;
  };

  lastLoadedAt?: string;
  onRefresh?: () => void;

  isLoading?: boolean;
  isError?: boolean;
  errorText?: string;

  sentinelRef?: (el: HTMLDivElement | null) => void;

  noMoreText?: string;
  empty?: EmptyStateProps;

  className?: string;
};

export default function PostList({
  items,
  onItemClick,
  topBar,
  lastLoadedAt,
  onRefresh,
  isLoading,
  isError,
  errorText,
  sentinelRef,
  noMoreText = "마지막 페이지입니다.",
  empty,
  className,
}: PostListProps) {
  const isEmpty = items.length === 0;

  return (
    <section className={className ?? ""}>
      {/* 상단: 제목줄 + (제목 아래) LastLoadedBar */}
      {topBar && (
        <BoardTopBar
          boardName={topBar.boardName}
          onOpenSort={topBar.onOpenSort}
          onOpenTag={topBar.onOpenTag}
          onWrite={topBar.onWrite}
          className="mb-2 px-3"
          meta={
            <LastLoadedBar
              lastLoadedAt={lastLoadedAt}
              onRefresh={onRefresh}
              compact
              iconOnly /* ← 아이콘만 원형 버튼 */
            />
          }
        />
      )}

      {/* 좌우 패딩 공통 래퍼 → 헤더/행 정렬 일치 */}
      <div className="px-3">
        {/* 데스크톱(테이블) */}
        <div className="hidden md:block">
          {/* 모든 헤더 컬럼 중앙 정렬 */}
          <div
            className={`${FREE_LIST_GRID} gap-2 py-2 text-xs font-medium text-base-content/60`}
          >
            <div className="text-center">번호</div>
            <div className="text-center">제목</div>
            <div className="text-center">글쓴이</div>
            <div className="text-center">등록일</div>
            <div className="text-center">조회</div>
            <div className="text-center">추천</div>
          </div>

          {!isEmpty && (
            <ul className="divide-y divide-base-300">
              {items.map((it) => (
                <li key={String(it.id)}>
                  <PostRow item={it} onClick={onItemClick} />
                </li>
              ))}
            </ul>
          )}

          {isEmpty && !isLoading && !isError && <EmptyState {...empty} />}
          {isError && (
            <div className="py-10 text-center text-sm text-red-500">
              {errorText ?? "오류가 발생했습니다."}
            </div>
          )}
          {isLoading && (
            <div className="py-6 text-center text-sm">불러오는 중…</div>
          )}
        </div>

        {/* 모바일(카드) */}
        <div className="md:hidden">
          {!isEmpty && (
            <ul className="space-y-2 max-[360px]:space-y-1.5">
              {items.map((it) => (
                <li key={String(it.id)}>
                  <PostCard item={it} onClick={onItemClick} />
                </li>
              ))}
            </ul>
          )}

          {isEmpty && !isLoading && !isError && <EmptyState {...empty} />}
          {isError && (
            <div className="py-10 text-center text-sm text-red-500">
              {errorText ?? "오류가 발생했습니다."}
            </div>
          )}
          {isLoading && (
            <div className="py-6 text-center text-sm">불러오는 중…</div>
          )}
        </div>

        {/* 센티넬 & no-more */}
        {!isEmpty && (
          <div className="mt-2">
            <ScrollSentinel innerRef={sentinelRef} />
          </div>
        )}
        {!isLoading && !isEmpty && (
          <div className="py-6 text-center text-xs text-base-content/60">
            {noMoreText}
          </div>
        )}
      </div>
    </section>
  );
}
