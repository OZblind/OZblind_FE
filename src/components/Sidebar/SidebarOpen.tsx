import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";

export function SidebarOpen({ onToggle }: { onToggle: () => void }) {
  const themeIcon = useThemeIcon();
  const menuIcon = themeIcon === "oz_dark" ? icons.menu.dark : icons.menu.light;
  const notificationsIcon =
    themeIcon === "oz_dark"
      ? icons.notifications.dark
      : icons.notifications.light;

  return (
    <div className="flex flex-col items-center w-full h-full bg-base-200 p-6">
      <div className="flex justify-between w-[260px] h-[24px]">
        <button onClick={onToggle}>
          <img src={notificationsIcon} alt="notificationsIcon" />
        </button>
        <button onClick={onToggle}>
          <img src={menuIcon} alt="menuIcon" />
        </button>
      </div>
    </div>
  );
}
