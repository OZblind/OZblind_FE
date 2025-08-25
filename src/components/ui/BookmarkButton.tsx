import { Bookmark } from "lucide-react";
import clsx from "clsx";
import { useBookmark } from "@hooks/useBookmark";
import { useEffect, useMemo, useState } from "react";
import { fmtNum } from "@src/utils/utils";

type Props = {
  postId: number | string;
  initialBookmarked?: boolean;
  initialCount: number | string;
  onCountChange?: (nextCount: number) => void;
};

export default function BookmarkButton({
  postId,
  initialBookmarked = false,
  initialCount,
  onCountChange,
}: Props) {
  const postIdNum = useMemo(() => Number(postId), [postId]);
  const init = useMemo(() => {
    const n = Number(initialCount);
    return Number.isFinite(n) ? n : 0;
  }, [initialCount]);

  const [count, setCount] = useState(init);
  useEffect(() => setCount(init), [init]);

  const { bookmarked, loading, toggle } = useBookmark({
    postId: postIdNum,
    initial: initialBookmarked,
    onCountChange: (delta) => {
      setCount((c) => {
        const next = Math.max(0, c + delta);
        onCountChange?.(next);
        return next;
      });
    },
  });

  return (
    <button
      className={clsx(
        "btn btn-ghost btn-sm",
        bookmarked && "text-primary",
        loading && "opacity-60"
      )}
      onClick={toggle}
      aria-pressed={!!bookmarked}
      type="button"
    >
      <Bookmark className="mr-2 h-4 w-4" /> {fmtNum(count)}{" "}
      {/* ← 오직 count만 표시 */}
    </button>
  );
}
