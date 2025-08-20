import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import EmptyState, {
  type EmptyStateProps,
} from "@components/Board/common/EmptyState";
import PostRow, { type FreeBoardItem, FREE_LIST_GRID } from "./PostRow";
import PostCard from "./PostCard";
import { LastLoadedBar, BoardTopBar } from "../common";
import { useRef, useState } from "react";
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
}: PostListProps) {
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const [openSort, setOpenSort] = useState(false);
  const [sort, setSort] = useState<SortValue>("latest"); // UI 전용 상태 (나중에 로직 연결)
  const sortActive = sort !== "latest";

  const isEmpty = items.length === 0;

  return (
    <section className={className ?? ""}>
      {topBar && (
        <BoardTopBar
          boardName={topBar.boardName}
          onOpenSort={() => setOpenSort((v) => !v)} // 로컬 토글
          onOpenTag={topBar.onOpenTag}
          onWrite={topBar.onWrite}
          sortButtonRef={sortBtnRef} // 앵커 ref 전달
          sortActive={sortActive}
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

        {!isError && !isLoading && isEmpty && <EmptyState {...empty} />}

        {!isError && !(isLoading && isEmpty) && !isEmpty && (
          <>
            {/* 데스크톱(테이블) */}
            <div className="hidden md:block">
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

              <ul className="divide-y divide-base-300">
                {items.map((it) => (
                  <li key={String(it.id)}>
                    <PostRow item={it} onClick={onItemClick} />
                  </li>
                ))}
              </ul>
            </div>

            {/* 모바일(카드) */}
            <div className="md:hidden">
              <ul className="space-y-2 max-[360px]:space-y-1.5">
                {items.map((it) => (
                  <li key={String(it.id)}>
                    <PostCard item={it} onClick={onItemClick} />
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

      {/* ✅ 정렬 팝오버 (UI 전용) */}
      <SortRadioPopover
        open={openSort}
        anchorRef={sortBtnRef}
        value={sort}
        onChange={(v) => {
          setSort(v); /* 지금은 UI만 */
        }}
        onRequestClose={() => setOpenSort(false)}
      />
    </section>
  );
}
