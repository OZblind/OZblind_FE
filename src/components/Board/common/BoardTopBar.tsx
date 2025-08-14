import { FilterIconButton } from "./FilterIconButton";
import { WriteButton } from "./WriteButton";

type Props = {
  boardName: string; // 예: "자유 게시판"
  onOpenSort?: () => void; // 정렬 필터 열기
  onOpenTag?: () => void; // 태그 필터 열기
  onWrite?: () => void; // 글쓰기
  className?: string;
};

export function BoardTopBar({
  boardName,
  onOpenSort,
  onOpenTag,
  onWrite,
  className,
}: Props) {
  return (
    <div
      className={`flex items-center justify-between gap-2 ${className ?? ""}`}
    >
      <h2 className="text-base font-medium">{boardName}</h2>
      <div className="inline-flex items-center gap-2">
        <FilterIconButton kind="sort" onClick={onOpenSort} />
        <FilterIconButton kind="tag" onClick={onOpenTag} />
        <WriteButton onClick={onWrite} />
      </div>
    </div>
  );
}
