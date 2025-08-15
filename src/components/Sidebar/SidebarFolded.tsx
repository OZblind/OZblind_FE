import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";

export function SidebarFolded({ onToggle }: { onToggle: () => void }) {
  const themeIcon = useThemeIcon();
  const menuIcon = themeIcon === "oz_dark" ? icons.menu.dark : icons.menu.light;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full bg-base-200 py-6">
      <button onClick={onToggle}>
        <img src={menuIcon} alt="menuIcon" />
      </button>
    </div>
  );
}
