import { useId, useMemo } from "react";

export type PositionValue = "front" | "back" | "startup" | "design";

type Option = { value: PositionValue; label: string; disabled?: boolean };

export default function PositionRadio({
  value,
  onChange,
  className = "",
  groupLabel = "포지션 필터",
  options,
}: {
  value: PositionValue;
  onChange: (v: PositionValue) => void;
  className?: string;
  groupLabel?: string;
  options?: Option[];
}) {
  const groupId = useId();

  const OPS = useMemo<Option[]>(
    () =>
      options ?? [
        { value: "front", label: "프론트엔드" },
        { value: "back", label: "백엔드" },
        { value: "startup", label: "창업" },
        { value: "design", label: "디자인" },
      ],
    [options]
  );

  return (
    <div className={className}>
      <span id={groupId} className="sr-only">
        {groupLabel}
      </span>

      <div
        role="radiogroup"
        aria-labelledby={groupId}
        className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3"
      >
        {OPS.map((o) => {
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
                "border border-base-300 hover:border-base-200",
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
