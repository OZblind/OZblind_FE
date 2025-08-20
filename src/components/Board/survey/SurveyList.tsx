import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import SurveyCard, { type SurveyCardProps } from "./SurveyCard";
import EmptyState, { type EmptyStateProps } from "../common/EmptyState";
import { LastLoadedBar, BoardTopBar } from "../common";
import { useRef, useState } from "react";
import SortRadioPopover from "@components/Board/common/sort/SortRadioPopover";
import type { SortValue } from "@src/types/sort";

export type SurveyListProps = {
  items: SurveyCardProps[];
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

  empty?: EmptyStateProps;

  className?: string;
};

export default function SurveyList({
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
}: SurveyListProps) {
  const isEmpty = items.length === 0;
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const [openSort, setOpenSort] = useState(false);
  const [sort, setSort] = useState<SortValue>("latest"); // 기본값: 최신

  return (
    <section className={className ?? ""}>
      {topBar && (
        <BoardTopBar
          boardName={topBar.boardName}
          onOpenSort={() => setOpenSort((v) => !v)} // 로컬 토글
          onOpenTag={topBar.onOpenTag}
          onWrite={topBar.onWrite}
          sortButtonRef={sortBtnRef} // 팝오버 앵커
          sortActive={sort !== "latest"} // 활성 배지
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
            <ul className="grid gap-3 md:gap-4 grid-cols-1">
              {items.map((it) => (
                <li key={it.id}>
                  <SurveyCard {...it} onClick={(id) => onItemClick?.(id)} />
                </li>
              ))}

              {/* 리스트가 이미 있을 때의 추가 로딩 스켈레톤 (임시) */}
              {isLoading &&
                items.length > 0 &&
                Array.from({ length: 2 }).map((_, i) => (
                  <li
                    key={`sk-${i}`}
                    className="h-28 md:h-32 rounded-xl bg-base-200 animate-pulse"
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

      {/* 정렬 팝오버(UI) */}
      <SortRadioPopover
        open={openSort}
        anchorRef={sortBtnRef}
        value={sort}
        onChange={(v) => setSort(v)} // 지금은 상태만 변경
        onRequestClose={() => setOpenSort(false)}
      />
    </section>
  );
}
