import { LastLoadedBar } from "@components/Board/common/LastLoadedBar";
import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";
import { PostRow, type FreeBoardItem } from "./PostRow";
import { PostCard } from "./PostCard";

export type PostListProps = {
  items: FreeBoardItem[];
  onItemClick?: (id: FreeBoardItem["id"]) => void;

  // 상단 상태 바
  lastLoadedAt?: string | Date;
  onRefresh?: () => void;

  // 상태 표시
  isLoading?: boolean;
  isError?: boolean;
  errorText?: string;

  // 무한 스크롤 앵커 ref
  sentinelRef?: (el: HTMLDivElement | null) => void;

  /** 더 불러올 것이 없을 때(선택) */
  noMoreText?: string;

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

  className,
}: PostListProps) {
  return (
    <section className={className ?? ""}>
      {/* 상단 상태바 */}
      <LastLoadedBar lastLoadedAt={lastLoadedAt} onRefresh={onRefresh} />

      {/* 데스크톱: 테이블 레이아웃 */}
      <div className="hidden md:block">
        {/* 헤더 */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-neutral-500">
          <div className="col-span-1 text-center">번호</div>
          <div className="col-span-5">제목</div>
          <div className="col-span-2">글쓴이</div>
          <div className="col-span-2">등록일</div>
          <div className="col-span-1 text-right">조회</div>
          <div className="col-span-1 text-right">추천</div>
        </div>

        {/* 리스트 */}
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {items.map((it) => (
            <li key={String(it.id)}>
              <PostRow item={it} onClick={onItemClick} />
            </li>
          ))}
        </ul>

        {/* 상태 영역 */}
        {items.length === 0 && !isLoading && !isError && (
          <div className="py-10 text-center text-sm text-neutral-500">
            게시글이 없습니다.
          </div>
        )}
        {isError && (
          <div className="py-10 text-center text-sm text-error">
            {errorText ?? "오류가 발생했습니다."}
          </div>
        )}
        {isLoading && (
          <div className="py-6 text-center text-sm">불러오는 중…</div>
        )}
      </div>

      {/* 모바일: 카드 레이아웃 */}
      <div className="md:hidden">
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={String(it.id)}>
              <PostCard item={it} onClick={onItemClick} />
            </li>
          ))}
        </ul>

        {/* 상태 영역 */}
        {items.length === 0 && !isLoading && !isError && (
          <div className="py-10 text-center text-sm text-neutral-500">
            게시글이 없습니다.
          </div>
        )}
        {isError && (
          <div className="py-10 text-center text-sm text-error">
            {errorText ?? "오류가 발생했습니다."}
          </div>
        )}
        {isLoading && (
          <div className="py-6 text-center text-sm">불러오는 중…</div>
        )}
      </div>

      {/* 무한 스크롤 앵커 */}
      <div className="mt-2">
        <ScrollSentinel innerRef={sentinelRef} />
      </div>

      {/* 더 불러올 데이터가 없을 때 안내(실제 가드는 상위 훅 disabled로) */}
      {!isLoading && items.length > 0 && (
        <div className="py-6 text-center text-xs text-neutral-500">
          {noMoreText}
        </div>
      )}
    </section>
  );
}
