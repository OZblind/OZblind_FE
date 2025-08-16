import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import { NotificationModal } from "@components/Notice";
import { useState } from "react";
import ProfileSection from "./ProfileSection";

export function SidebarOpen({ onToggle }: { onToggle: () => void }) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const themeIcon = useThemeIcon();
  const menuIcon = themeIcon === "oz_dark" ? icons.menu.dark : icons.menu.light;
  const notificationsIcon =
    themeIcon === "oz_dark"
      ? icons.notifications.dark
      : icons.notifications.light;

  return (
    <div className="flex flex-col items-center w-full h-full bg-base-200 p-6">
      <NotificationModal
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
      />
      <div className="flex justify-between w-[260px] h-[24px]">
        <button onClick={() => setNoticeOpen(true)}>
          <img src={notificationsIcon} alt="notificationsIcon" />
        </button>
        <button onClick={onToggle}>
          <img src={menuIcon} alt="menuIcon" />
        </button>
      </div>
      <ProfileSection />
    </div>
  );
}
