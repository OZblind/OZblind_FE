import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import EmptyState, {
  type EmptyStateProps,
} from "@components/Board/common/EmptyState";
import SurveyCard, { type SurveyCardProps } from "./SurveyCard";
import { BoardTopBar, LastLoadedBar } from "../common";

export type SurveyListProps = {
  /** UI용 아이템 배열(상위에서 상태 판정 완료할 것) */
  items: SurveyCardProps[];
  onItemClick?: (id: string) => void;

  /** 상단 바(옵션) */
  topBar?: {
    boardName: string;
    onOpenSort?: () => void;
    onOpenTag?: () => void;
    onWrite?: () => void;
  };

  /** 마지막 로드 시각/새로고침 */
  lastLoadedAt?: string;
  onRefresh?: () => void;

  /** 상태 제어 */
  isLoading?: boolean;
  isError?: boolean;
  errorText?: string;

  /** 무한 스크롤 */
  hasMore?: boolean;
  sentinelRef?: (el: HTMLDivElement | null) => void;
  noMoreText?: string;

  /** 빈 상태 커스터마이즈 */
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

        {!isError && !isLoading && isEmpty && <EmptyState {...empty} />}

        {!isError && !(isLoading && isEmpty) && !isEmpty && (
          <>
            {/* 반응형: <768px 1열 / ≥768px 2열, 균등 높이 */}
            <ul
              className="
                grid gap-3 md:gap-4 items-stretch auto-rows-fr
                grid-cols-1 md:grid-cols-2
              "
            >
              {items.map((it) => (
                <li key={it.id} className="h-full">
                  <SurveyCard
                    {...it}
                    onClick={(id) => {
                      if (it.status === "active") onItemClick?.(id);
                    }}
                    className="h-full"
                  />
                </li>
              ))}

              {/* 로딩 스켈레톤 (리스트가 이미 있을 때) */}
              {isLoading &&
                !isEmpty &&
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
    </section>
  );
}
