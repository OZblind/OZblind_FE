import { LastLoadedBar } from "@components/Board/common/LastLoadedBar";
import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import {
  EmptyState,
  type EmptyStateProps,
} from "@components/Board/common/EmptyState";
import { PostRow, type FreeBoardItem, FREE_LIST_GRID } from "./PostRow";
import { PostCard } from "./PostCard";

export type PostListProps = {
  items: FreeBoardItem[];
  onItemClick?: (id: FreeBoardItem["id"]) => void;

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
      <LastLoadedBar lastLoadedAt={lastLoadedAt} onRefresh={onRefresh} />

      {/* 데스크톱(테이블) */}
      <div className="hidden md:block">
        {/* 헤더: 행과 동일한 고정 그리드 트랙 사용 */}
        <div
          className={`${FREE_LIST_GRID} gap-2 px-3 py-2 text-xs font-medium text-neutral-500`}
        >
          <div className="text-center">번호</div>
          <div>제목</div>
          <div>글쓴이</div>
          <div>등록일</div>
          <div className="text-right tabular-nums">조회</div>
          <div className="text-right tabular-nums">추천</div>
        </div>

        {!isEmpty && (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
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
          <ul className="space-y-2">
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

      {/* 센티넬: 아이템 있을 때만 */}
      {!isEmpty && (
        <div className="mt-2">
          <ScrollSentinel innerRef={sentinelRef} />
        </div>
      )}

      {!isLoading && !isEmpty && (
        <div className="py-6 text-center text-xs text-neutral-500">
          {noMoreText}
        </div>
      )}
    </section>
  );
}
