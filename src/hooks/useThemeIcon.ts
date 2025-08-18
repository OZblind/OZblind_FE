import { useEffect, useState } from "react";

type Theme = "oz_dark" | "oz_light";

/** 테마 */
export function useThemeIcon() {
  const [theme, setTheme] = useState<Theme>("oz_dark");

  useEffect(() => {
    // 로컬스토리지 값 있으면 반영
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) setTheme(savedTheme);

    // data-theme 속성 변경 감지
    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.getAttribute(
        "data-theme"
      ) as Theme;
      if (updatedTheme) setTheme(updatedTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
