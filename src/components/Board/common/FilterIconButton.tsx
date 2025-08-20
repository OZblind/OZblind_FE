import { forwardRef, useEffect, useMemo, useState } from "react";

import filterDark from "@assets/icons/icon-filter-list-dark.svg";
import filterLight from "@assets/icons/icon-filter-list-light.svg";
import tagDark from "@assets/icons/icon-label-dark.svg";
import tagLight from "@assets/icons/icon-label-light.svg";

type Kind = "sort" | "tag";

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  kind: Kind; // "sort" | "tag"
  active?: boolean;
  "aria-label"?: string;
};

// DOM에서 data-theme 읽기(SSR 안전)
function readIsDarkFromDOM(): boolean {
  if (typeof document === "undefined") return false;
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "oz_dark";
}

const FilterIconButton = forwardRef<HTMLButtonElement, Props>(
  ({ kind, active = false, onClick, className, ...rest }, ref) => {
    const [isDark, setIsDark] = useState<boolean>(() => readIsDarkFromDOM());

    useEffect(() => {
      if (typeof document === "undefined") return;

      const el = document.documentElement;
      const obs = new MutationObserver((muts) => {
        for (const m of muts) {
          if (m.type === "attributes" && m.attributeName === "data-theme") {
            setIsDark(readIsDarkFromDOM());
          }
        }
      });
      obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });

      const onStorage = (e: StorageEvent) => {
        if (e.key === "theme") setIsDark(readIsDarkFromDOM());
      };
      window.addEventListener("storage", onStorage);

      return () => {
        obs.disconnect();
        window.removeEventListener("storage", onStorage);
      };
    }, []);

    const src = useMemo(() => {
      if (kind === "sort") return isDark ? filterDark : filterLight;
      return isDark ? tagDark : tagLight;
    }, [kind, isDark]);

    const label =
      rest["aria-label"] ?? (kind === "sort" ? "정렬 필터" : "태그 필터");

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active || undefined}
        onClick={onClick}
        aria-label={label}
        {...rest}
        className={[
          "relative inline-flex items-center justify-center rounded-md border border-base-300 p-1.5 hover:bg-base-200/60",
          className ?? "",
        ].join(" ")}
      >
        <img src={src} alt="" className="h-5 w-5" />
        {active && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary ring-2 ring-base-100"
          />
        )}
      </button>
    );
  }
);

FilterIconButton.displayName = "FilterIconButton";
export default FilterIconButton;
