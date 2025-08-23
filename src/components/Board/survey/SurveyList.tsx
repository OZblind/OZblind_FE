import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import SurveyCard, { type SurveyCardProps } from "./SurveyCard";
import EmptyState, { type EmptyStateProps } from "../common/EmptyState";
import { LastLoadedBar, BoardTopBar } from "../common";
import { useRef, useState } from "react";
import SortRadioPopover from "@components/Board/common/sort/SortRadioPopover";
import type { SortValue } from "@src/types/sort";
import TagFilterPopover from "@components/Board/common/tagfilter/TagFilterPopover";
import type { PositionValue } from "@components/Board/common/tagfilter/PositionRadio";
import { LIST_MESSAGES } from "@src/constants/ui";

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

  scrollRootRef?: (el: HTMLDivElement | null) => void;
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
  noMoreText = LIST_MESSAGES.NO_MORE,
  empty,
  className,
  scrollRootRef,
}: SurveyListProps) {
  const isEmpty = items.length === 0;

  // ------ 정렬(UI) ------
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const [openSort, setOpenSort] = useState(false);
  const [sort, setSort] = useState<SortValue>("latest"); // UI 전용

  // ------ 태그(UI) ------
  const tagBtnRef = useRef<HTMLButtonElement>(null);
  const [openTag, setOpenTag] = useState(false);
  const [position, setPosition] = useState<PositionValue>("back");
  const [cohort, setCohort] = useState<number>(11);
  const tagActive = position !== "back" || cohort !== 11;

  return (
    <section className={`flex h-full flex-col ${className ?? ""}`}>
      {topBar && (
        <BoardTopBar
          boardName={topBar.boardName}
          onOpenSort={() => setOpenSort((v) => !v)}
          onOpenTag={() => setOpenTag((v) => !v)}
          onWrite={topBar.onWrite}
          sortButtonRef={sortBtnRef}
          sortActive={sort !== "latest"}
          tagButtonRef={tagBtnRef}
          tagActive={tagActive}
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

      {/* 태그 팝오버 추가 */}
      <TagFilterPopover
        open={openTag}
        anchorRef={tagBtnRef}
        position={position}
        cohort={cohort}
        onChangePosition={setPosition}
        onChangeCohort={setCohort}
        onReset={() => {
          setPosition("front");
          setCohort(11);
        }}
        onApply={() => {
          // UI 전용: 실제 fetch/refetch는 상위 승격 시 연결
          // (PostList에서 쓰던 패턴 그대로)
        }}
        onRequestClose={() => setOpenTag(false)}
      />
    </section>
  );
}
