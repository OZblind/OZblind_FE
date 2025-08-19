import { useId } from "react";
import { useSortRadioKeyboard } from "@hooks/sort/useSortRadioKeyboard";
import { SORT_OPTIONS, type SortValue } from "../../../../types/sort";

type Option = { value: SortValue; label: string; disabled?: boolean };

export default function SortRadio({
  value,
  onChange,
  options = SORT_OPTIONS,
  className = "",
  groupLabel = "게시글 정렬",
}: {
  value: SortValue;
  onChange: (v: SortValue) => void;
  options?: Option[];
  className?: string;
  groupLabel?: string;
}) {
  const groupId = useId();
  const { onKeyDown } = useSortRadioKeyboard<SortValue>({
    value,
    options,
    onChange,
  });

  return (
    <div className={className}>
      <span id={groupId} className="sr-only">
        {groupLabel}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={groupId}
        onKeyDown={onKeyDown}
        className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3"
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
                "h-9 rounded-xl border transition flex items-center gap-2 px-3",
                "border-base-300 hover:border-base-200",
                selected ? "ring-2 ring-primary/60 border-primary" : "",
                o.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                "bg-base-100 text-base-content",
              ].join(" ")}
            >
              {/* 커스텀 라디오 아이콘 */}
              <span
                aria-hidden
                className={[
                  "inline-flex items-center justify-center size-4 rounded-full border",
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
              <span className="text-sm md:text-[15px]">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
