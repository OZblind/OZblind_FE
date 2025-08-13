type Theme = "oz_dark" | "oz_light";

type Props = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeToggleButton: React.FC<Props> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    const newTheme = theme === "oz_dark" ? "oz_light" : "oz_dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex items-center justify-between border-b border-neutral-content py-6">
      라이트 모드 설정
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
