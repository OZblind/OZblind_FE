import { useEffect, useMemo, useState } from "react";

import filterDark from "@assets/icons/icon-filter-list-dark.svg";
import filterLight from "@assets/icons/icon-filter-list-light.svg";
import tagDark from "@assets/icons/icon-label-dark.svg";
import tagLight from "@assets/icons/icon-label-light.svg";

type Kind = "sort" | "tag";

type Props = {
  kind: Kind; // "sort" | "tag"
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
};

// DOM에서 data-theme 읽기(SSR 안전)
function readIsDarkFromDOM(): boolean {
  if (typeof document === "undefined") return false;
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "oz_dark";
}

export function FilterIconButton(props: Props) {
  const { kind, onClick, className } = props;
  const [isDark, setIsDark] = useState<boolean>(() => readIsDarkFromDOM());

  useEffect(() => {
    if (typeof document === "undefined") return;

    const el = document.documentElement;
    // data-theme 변경 감지
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          setIsDark(readIsDarkFromDOM());
        }
      }
    });
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });

    // 다른 탭에서 localStorage("theme") 수정 시 대응
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
    props["aria-label"] ?? (kind === "sort" ? "정렬 필터" : "태그 필터");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-md border border-base-300 p-1.5 hover:bg-base-200/60 ${className ?? ""}`}
    >
      <img src={src} alt="" className="h-5 w-5" />
    </button>
  );
}
