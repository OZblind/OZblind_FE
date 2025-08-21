import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import EmptyState, {
  type EmptyStateProps,
} from "@components/Board/common/EmptyState";
import PostRow, { type FreeBoardItem, FREE_LIST_GRID } from "./PostRow";
import PostCard from "./PostCard";
import { LastLoadedBar, BoardTopBar } from "../common";
import { useRef, useState, type ReactNode } from "react";
import SortRadioPopover from "@components/Board/common/sort/SortRadioPopover";
import type { SortValue } from "@src/types/sort";

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

  hasMore?: boolean;
  sentinelRef?: (el: HTMLDivElement | null) => void;
  noMoreText?: string;

  empty?: EmptyStateProps;
  className?: string;

  scrollRootRef?: (el: HTMLDivElement | null) => void;

  renderAuthorSubText?: (author: string) => ReactNode;
  renderAuthorBadges?: (author: string) => ReactNode;
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
  hasMore,
  sentinelRef,
  noMoreText = "마지막 페이지입니다.",
  empty,
  className,
  scrollRootRef,
  renderAuthorSubText,
  renderAuthorBadges,
}: PostListProps) {
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const [openSort, setOpenSort] = useState(false);
  const [sort, setSort] = useState<SortValue>("latest");
  const sortActive = sort !== "latest";

  const isEmpty = items.length === 0;

  return (
    <section className={`flex h-full flex-col ${className ?? ""}`}>
      {topBar && (
        <BoardTopBar
          boardName={topBar.boardName}
          onOpenSort={() => setOpenSort((v) => !v)}
          onOpenTag={topBar.onOpenTag}
          onWrite={topBar.onWrite}
          sortButtonRef={sortBtnRef}
          sortActive={sortActive}
          className="mb-2 px-3 flex-none"
          meta={
            <LastLoadedBar
              lastLoadedAt={lastLoadedAt}
              onRefresh={onRefresh}
              compact
              iconOnly
            />
          }
        />
      )}

      <div
        ref={scrollRootRef}
        className="px-3 flex-1 min-h-0 overflow-y-auto overscroll-contain"
      >
        {isError && (
          <div className="py-10 text-center text-sm text-red-500">
            {errorText ?? "오류가 발생했습니다."}
          </div>
        )}

        {!isError && isLoading && isEmpty && (
          <div className="py-6 text-center text-sm">불러오는 중…</div>
        )}

        {!isError && !isLoading && isEmpty && <EmptyState {...empty} />}

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
                {items.map((it) => (
                  <li key={String(it.id)}>
                    <PostRow
                      item={it}
                      onClick={onItemClick}
                      authorSubText={renderAuthorSubText?.(it.author)}
                    />
                  </li>
                ))}
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
                      authorBadges={renderAuthorBadges?.(it.author)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* 센티넬 & 마지막 페이지 문구 */}
            <div className="mt-2">
              {hasMore !== false && <ScrollSentinel innerRef={sentinelRef} />}
            </div>

            {!isLoading && hasMore === false && (
              <div className="py-6 text-center text-xs text-base-content/60">
                {noMoreText}
              </div>
            )}
          </>
        )}
      </div>

      <SortRadioPopover
        open={openSort}
        anchorRef={sortBtnRef}
        value={sort}
        onChange={(v) => setSort(v)}
        onRequestClose={() => setOpenSort(false)}
      />
    </section>
  );
}
