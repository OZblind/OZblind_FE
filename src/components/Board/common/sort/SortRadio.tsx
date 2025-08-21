import { useId } from "react";
import { SORT_OPTIONS, type SortValue } from "@src/types/sort";

type Option = { value: SortValue; label: string; disabled?: boolean };

type Layout = "grid" | "list";

export default function SortRadio({
  value,
  onChange,
  options = SORT_OPTIONS,
  className = "",
  groupLabel = "게시글 정렬",
  layout = "grid",
}: {
  value: SortValue;
  onChange: (v: SortValue) => void;
  options?: Option[];
  className?: string;
  groupLabel?: string;
  layout?: Layout;
}) {
  const groupId = useId();

  return (
    <div className={className}>
      <span id={groupId} className="sr-only">
        {groupLabel}
      </span>

      <div
        role="radiogroup"
        aria-labelledby={groupId}
        className={
          layout === "list"
            ? "flex flex-col gap-2"
            : "grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3"
        }
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={selected}
              aria-disabled={o.disabled || undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => !o.disabled && onChange(o.value)}
              className={[
                "w-full h-9 px-3 rounded-xl transition flex items-center gap-2 justify-start",
                "border-base-300 hover:border-base-200",
                o.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                "text-base-content",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "flex items-center justify-center size-4 rounded-full border shrink-0",
                  selected ? "border-primary" : "border-base-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "block rounded-full size-2",
                    selected ? "bg-primary" : "bg-transparent",
                  ].join(" ")}
                />
              </span>

              {/* ⬇️ 줄바꿈/글자 쪼개짐 방지 */}
              <span className="text-sm whitespace-nowrap break-keep">
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
