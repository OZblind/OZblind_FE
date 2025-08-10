import React, { useEffect, useState } from "react";

const ThemeToggleButton: React.FC = () => {
  const [theme, setTheme] = useState<"oz_dark" | "oz_light">("oz_dark");

  // 첫 로드 시 현재 HTML data-theme 값 읽기
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "oz_light" || currentTheme === "oz_dark") {
      setTheme(currentTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "oz_dark" ? "oz_light" : "oz_dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  };

  return (
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
  );
};

export default ThemeToggleButton;
