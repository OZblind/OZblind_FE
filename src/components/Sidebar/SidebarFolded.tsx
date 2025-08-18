import { useMemo, useState } from "react";
import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import profile from "@assets/images/profile.jpg";
import { NotificationModal } from "@components/Notice";

export function SidebarFolded({ onToggle }: { onToggle: () => void }) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const themeIcon = useThemeIcon();
  const { menuIcon, notificationsIcon } = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return {
      menuIcon: dark ? icons.menu.dark : icons.menu.light,
      notificationsIcon: dark
        ? icons.notifications.dark
        : icons.notifications.light,
    };
  }, [themeIcon]);

  return (
    <div className="flex flex-col items-center justify-between w-full h-full bg-base-200 p-2 py-4">
      <button onClick={onToggle} className="p-2 rounded-full hover:bg-base-300">
        <img src={menuIcon} alt="menuIcon" />
      </button>

      <div className="flex flex-col gap-4 items-center">
        <NotificationModal
          open={noticeOpen}
          onClose={() => setNoticeOpen(false)}
        />
        <button
          onClick={() => setNoticeOpen(true)}
          className="p-2 rounded-full hover:bg-base-300"
        >
          <img src={notificationsIcon} alt="notificationsIcon" />
        </button>
        <button className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-base-300 hover:scale-110">
          <img
            src={profile}
            alt="profile"
            className="w-8 h-8 rounded-full"
            loading="lazy"
          />
        </button>
      </div>
    </div>
  );
}
