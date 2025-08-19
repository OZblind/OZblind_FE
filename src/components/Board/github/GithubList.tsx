import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import { LastLoadedBar, BoardTopBar } from "@components/Board/common";
import GithubCard, { type GithubCardProps } from "./GithubCard";

export type GithubListItem = GithubCardProps;

export type GithubListProps = {
  items: GithubListItem[];
  onItemClick?: (id: string) => void;

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

  emptyText?: string;
  className?: string;
};

export default function GithubList({
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
  emptyText = "등록된 레포가 없습니다.",
  className,
}: GithubListProps) {
  const isEmpty = items.length === 0;

  return (
    <section className={className ?? ""}>
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
              iconOnly
            />
          }
        />
      )}

      <div className="px-3">
        {isError && (
          <div className="py-10 text-center text-sm text-red-500">
            {errorText ?? "오류가 발생했습니다."}
          </div>
        )}

        {!isError && isLoading && isEmpty && (
          <div className="py-6 text-center text-sm">불러오는 중…</div>
        )}

        {!isError && !isLoading && isEmpty && (
          <div className="py-10 text-center text-sm text-base-content/60">
            {emptyText}
          </div>
        )}

        {!isError && !(isLoading && isEmpty) && !isEmpty && (
          <>
            {/* 항상 단일열(768 기준 무관) */}
            <ul className="grid grid-cols-1 gap-3 md:gap-4">
              {items.map((it) => (
                <li key={it.id}>
                  <GithubCard {...it} onClick={(id) => onItemClick?.(id)} />
                </li>
              ))}

              {/* 추가 로딩 스켈레톤 (간단한 박스) */}
              {isLoading &&
                items.length > 0 &&
                Array.from({ length: 2 }).map((_, i) => (
                  <li
                    key={`sk-${i}`}
                    className="h-24 md:h-28 rounded-xl bg-base-200 animate-pulse"
                  />
                ))}
            </ul>

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
    </section>
  );
}
