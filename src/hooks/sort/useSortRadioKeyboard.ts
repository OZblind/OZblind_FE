import { useCallback, useMemo } from "react";

export type RadioOption<V extends string> = { value: V; disabled?: boolean };

export function useSortRadioKeyboard<V extends string>({
  value,
  options,
  onChange,
}: {
  value: V;
  options: RadioOption<V>[];
  onChange: (v: V) => void;
}) {
  const idx = useMemo(
    () =>
      Math.max(
        0,
        options.findIndex((o) => o.value === value)
      ),
    [options, value]
  );

  const move = useCallback(
    (dir: 1 | -1) => {
      if (!options.length) return;
      let i = idx;
      for (let step = 0; step < options.length; step++) {
        i = (i + dir + options.length) % options.length;
        if (!options[i].disabled) {
          onChange(options[i].value);
          break;
        }
      }
    },
    [idx, options, onChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          move(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          move(-1);
          break;
        case "Home":
          {
            e.preventDefault();
            const first = options.find((o) => !o.disabled);
            if (first) onChange(first.value);
          }
          break;
        case "End":
          {
            e.preventDefault();
            for (let i = options.length - 1; i >= 0; i--) {
              if (!options[i].disabled) {
                onChange(options[i].value);
                break;
              }
            }
          }
          break;
      }
    },
    [move, options, onChange]
  );

  return { onKeyDown };
}
