import { useCallback } from "react";

export default function CohortSlider({
  value,
  min = 1,
  max = 20,
  onChange,
  onReset,
  className = "",
  label = "기수 필터",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  onReset?: () => void;
  className?: string;
  label?: string;
}) {
  const handle = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => onChange(Number(e.target.value)),
    [onChange]
  );

  return (
    <div className={["px-1", className].join(" ")}>
      <div className="text-xs text-base-content/60 mb-2">{label}</div>

      <div className="flex items-center justify-between text-xs text-base-content/60 mb-2">
        <span>{min}기</span>
        <span>{max}기</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={handle}
        className="range range-primary"
        aria-label={label}
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-medium">{value}기</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-primary text-sm hover:underline"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );
}
