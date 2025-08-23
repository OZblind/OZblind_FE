import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import { useLogoutMutation } from "@hooks/useAuthQueries";
import { useMemo } from "react";

export default function LogoutSection() {
  const themeIcon = useThemeIcon();
  const logoutBtnIcon = icons.logoutBtn.default;
  const logoutBtnHoverIcon = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return dark ? icons.logoutBtn.hover.dark : icons.logoutBtn.hover.light;
  }, [themeIcon]);

  const { mutate } = useLogoutMutation();

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      mutate();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <button className="group relative w-14 h-14 m-8" onClick={handleLogout}>
        <img
          src={logoutBtnIcon}
          alt="logout"
          className="absolute inset-0 w-full h-full group-hover:opacity-0 transition-opacity duration-200"
        />
        <img
          src={logoutBtnHoverIcon}
          alt="logout-hover"
          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </button>
    </div>
  );
}
