import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import EmptyState, {
  type EmptyStateProps,
} from "@components/Board/common/EmptyState";
import PostRow, { type FreeBoardItem, FREE_LIST_GRID } from "./PostRow";
// import PostCard from "./PostCard"; // 반응형 임시 삭제, UI 통일감 목적
import { LastLoadedBar, BoardTopBar } from "../common";
import { useEffect, useRef, useState, type ReactNode } from "react";
import SortRadioPopover from "@components/Board/common/sort/SortRadioPopover";
import TagFilterPopover from "@components/Board/common/tagfilter/TagFilterPopover";
import type { SortValue } from "@src/types/sort";
import type { PositionValue } from "@src/types/tag";
import { ERROR_MESSAGES, LIST_MESSAGES, LOADING_MESSAGES } from "@constants/ui";
import { useScrollRoot } from "@components/commons/ScrollToTop/useScrollRoot";

export type PostListProps = {
  items: FreeBoardItem[];
  onItemClick?: (id: FreeBoardItem["id"]) => void;

  topBar?: {
    boardName: string;
    // onOpenSort는 외부에서 넘기지 않아도 됨(내부 제어)
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

  renderAuthorLabel?: (item: FreeBoardItem) => ReactNode;

  sortValue?: SortValue;
  onChangeSort?: (v: SortValue) => void;

  tagValue?: { pos: PositionValue; cohort: number };
  tagApplied?: boolean; // 뱃지는 이거로만 판단
  onApplyTag?: (next: { pos: PositionValue; cohort: number } | null) => void;
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
  noMoreText = LIST_MESSAGES.NO_MORE,
  empty,
  className,
  scrollRootRef,
  renderAuthorLabel,
  sortValue,
  onChangeSort,
  tagValue,
  tagApplied,
  onApplyTag,
}: PostListProps) {
  const { setRoot } = useScrollRoot();

  const attachRef = (el: HTMLDivElement | null) => {
    scrollRootRef?.(el);
    setRoot(el);
  };

  // ------ 정렬(UI) ------
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const [openSort, setOpenSort] = useState(false);
  const [internalSort, setInternalSort] = useState<SortValue>("latest");
  const sort: SortValue = sortValue ?? internalSort;
  const sortActive = sort !== "latest";
  const handleSortChange = (v: SortValue) => {
    setInternalSort(v);
    onChangeSort?.(v);
  };

  // ------ 태그(UI) ------
  const tagBtnRef = useRef<HTMLButtonElement>(null);
  const [openTag, setOpenTag] = useState(false);
  const [position, setPosition] = useState<PositionValue>("back");
  const [cohort, setCohort] = useState<number>(11);
  const tagActive = !!tagApplied;

  // 부모에서 내려준 현재 선택값(tagValue)과 내부 상태 동기화
  useEffect(() => {
    if (!tagValue) return;
    // 동일 값일 때는 setState 스킵 (불필요한 리렌더 방지)
    if (position !== tagValue.pos) setPosition(tagValue.pos);
    if (cohort !== tagValue.cohort) setCohort(tagValue.cohort);
  }, [tagValue?.pos, tagValue?.cohort]); // eslint-disable-line react-hooks/exhaustive-deps

  const isEmpty = items.length === 0;

  return (
    <section className={`flex h-full flex-col ${className ?? ""}`}>
      {topBar && (
        <BoardTopBar
          boardName={topBar.boardName}
          onOpenSort={() => setOpenSort((v) => !v)}
          onOpenTag={() => setOpenTag((v) => !v)}
          onWrite={topBar.onWrite}
          sortButtonRef={sortBtnRef}
          tagButtonRef={tagBtnRef}
          sortActive={sortActive}
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

      {/* 본문 스크롤 컨테이너 */}
      <div
        ref={attachRef}
        className="w-full px-3 flex-1 min-h-0 h-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
      >
        {isError && (
          <div className="w-full py-10 text-center text-sm text-red-500">
            {errorText ?? ERROR_MESSAGES.GENERAL}
          </div>
        )}

        {!isError && isLoading && isEmpty && (
          <div className="w-full py-6 text-center text-sm">
            {LOADING_MESSAGES.POSTS}
          </div>
        )}

        {!isError && !isLoading && isEmpty && (
          <div className="w-full py-6">
            <EmptyState {...empty} />
          </div>
        )}

        {!isError && !(isLoading && isEmpty) && !isEmpty && (
          <>
            {/* 데스크톱(테이블) — 작성자 라인을 텍스트로 대체 */}
            {/* 반응형 추가시 아래 div className="hidden md:block" 로 교체 */}
            <div className="block">
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
                      authorLabel={renderAuthorLabel?.(it)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* (통일감 위해 반응형 제거) 모바일(카드) — 작성자 라인을 텍스트로 대체 */}
            {/* <div className="md:hidden">
              <ul className="space-y-2 max-[360px]:space-y-1.5">
                {items.map((it) => (
                  <li key={String(it.id)}>
                    <PostCard
                      item={it}
                      onClick={onItemClick}
                      authorLabel={renderAuthorLabel?.(it)}
                    />
                  </li>
                ))}
              </ul>
            </div> */}

            {/* 센티넬 */}
            <div className="mt-2">
              {hasMore !== false && <ScrollSentinel innerRef={sentinelRef} />}
            </div>

            {isLoading && items.length > 0 && (
              <div
                className="py-3 text-center text-xs opacity-70"
                aria-live="polite"
                role="status"
              >
                {LOADING_MESSAGES.POSTS}
              </div>
            )}

            {!isLoading && hasMore === false && (
              <div className="py-6 text-center text-xs text-base-content/60">
                {noMoreText}
              </div>
            )}
          </>
        )}
      </div>

      {/* 정렬 팝오버 */}
      <SortRadioPopover
        open={openSort}
        anchorRef={sortBtnRef}
        value={sort}
        onChange={handleSortChange}
        onRequestClose={() => setOpenSort(false)}
      />

      {/* 태그 팝오버 (UI) */}
      <TagFilterPopover
        open={openTag}
        anchorRef={tagBtnRef}
        position={position}
        cohort={cohort}
        onChangePosition={setPosition}
        onChangeCohort={setCohort}
        onReset={() => {
          setPosition("back");
          setCohort(11);
        }}
        onApply={(next) => {
          onApplyTag?.(next); // {pos, cohort} | null
          setOpenTag(false);
        }}
        onRequestClose={() => setOpenTag(false)}
      />
    </section>
  );
}
