import React, { useEffect, useState } from "react";

const ThemeToggleButton: React.FC = () => {
  const [theme, setTheme] = useState<"oz_dark" | "oz_light">("oz_dark");

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
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "oz_dark" ? "oz_light" : "oz_dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex items-center justify-between border-b border-neutral-content py-6">
      다크 모드 설정
      <button
        onClick={toggleTheme}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
    ${theme === "oz_dark" ? "bg-gray-700" : "bg-primary"}`}
      >
        <div
          className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300
      ${theme === "oz_dark" ? "translate-x-0" : "translate-x-6"}`}
        />
      </button>
    </div>
  );
};

export default ThemeToggleButton;
