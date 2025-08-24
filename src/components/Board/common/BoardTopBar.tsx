import React from "react";
import WriteButton from "./WriteButton";
import FilterIconButton from "./FilterIconButton";

type Props = {
  boardName: string; // 게시판명
  onOpenSort?: () => void; // 정렬 필터
  onOpenTag?: () => void; // 태그 필터
  onWrite?: () => void; // 글쓰기 버튼
  meta?: React.ReactNode;
  className?: string;
  sortButtonRef?: React.Ref<HTMLButtonElement>;
  tagButtonRef?: React.Ref<HTMLButtonElement>;
  sortActive?: boolean;
  tagActive?: boolean;
};

export default function BoardTopBar({
  boardName,
  onOpenSort,
  onOpenTag,
  onWrite,
  meta,
  className,
  sortButtonRef,
  tagButtonRef,
  sortActive,
  tagActive,
}: Props) {
  return (
    <div className={`space-y-0.5 ${className ?? ""}`}>
      {/* 1행: 제목 · 버튼들 */}
      <div className="flex items-center justify-between gap-2">
        {/* 제목 너비 확보 + 잘림 방지 */}
        <h2 className="flex-1 min-w-0 truncate pr-2 text-base font-semibold leading-tight">
          {boardName}
        </h2>

        {/* 버튼군: 기본 36px, ≤380px 28px */}
        <div className="inline-flex items-center gap-2 max-[380px]:gap-1">
          <FilterIconButton
            ref={sortButtonRef}
            kind="sort"
            active={sortActive}
            onClick={onOpenSort}
            className="h-9 w-9 p-2 max-[380px]:size-7 max-[380px]:p-1"
          />
          <FilterIconButton
            ref={tagButtonRef}
            kind="tag"
            active={tagActive}
            onClick={onOpenTag}
            className="h-9 w-9 p-2 max-[380px]:size-7 max-[380px]:p-1"
          />
          <WriteButton
            onClick={onWrite}
            className="h-9 max-[380px]:size-7 max-[380px]:p-1"
          />
        </div>
      </div>

      {/* 2행: meta(LastLoadedBar 등) */}
      {meta && <div className="mt-0.5">{meta}</div>}
    </div>
  );
}
