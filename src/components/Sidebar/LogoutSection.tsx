import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";

export default function LogoutSection() {
  const themeIcon = useThemeIcon();
  const logoutBtnIcon = icons.logoutBtn.default;
  const logoutBtnHoverIcon =
    themeIcon === "oz_dark"
      ? icons.logoutBtn.hover.dark
      : icons.logoutBtn.hover.light;

  return (
    <div className="flex flex-col items-center w-full">
      <button className="group relative w-14 h-14 m-8">
        {/* 기본 아이콘 */}
        <img
          src={logoutBtnIcon}
          alt="logout"
          className="absolute inset-0 w-full h-full group-hover:opacity-0 transition-opacity duration-200"
        />
        {/* hover 아이콘 */}
        <img
          src={logoutBtnHoverIcon}
          alt="logout-hover"
          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </button>
    </div>
  );
}
