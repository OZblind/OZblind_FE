import { useEffect, useState } from "react";

type Theme = "oz_dark" | "oz_light";

/** 테마 */
export function useThemeIcon() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      // 동기적으로 즉시 올바른 값 반환
      const saved = localStorage.getItem("theme") as Theme | null;
      const dataTheme = document.documentElement.getAttribute(
        "data-theme"
      ) as Theme;
      return saved || dataTheme || "oz_dark";
    }
    return "oz_dark";
  });

  useEffect(() => {
    // 로컬스토리지 값 있으면 반영
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }

    // data-theme 속성 변경 감지
    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.getAttribute(
        "data-theme"
      ) as Theme;
      if (updatedTheme && updatedTheme !== theme) {
        setTheme(updatedTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [theme]);

  return theme;
}
