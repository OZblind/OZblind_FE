import { useEffect } from "react";

type Theme = "oz_dark" | "oz_light";

interface ThemeInitializerProps {
  setTheme: (theme: Theme) => void;
}

export function ThemeInitializer({ setTheme }: ThemeInitializerProps) {
  // 초기 로드 시 테마 설정
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as
      | "oz_dark"
      | "oz_light"
      | null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // 브라우저 다크모드 감지
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initialTheme = prefersDark ? "oz_dark" : "oz_light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, [setTheme]);

  return null;
}
