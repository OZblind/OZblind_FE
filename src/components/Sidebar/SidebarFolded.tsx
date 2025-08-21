import { useMemo, useState } from "react";
import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import profile from "@assets/images/profile.jpg";
import person from "@assets/images/person.png";
import { NotificationModal } from "@components/Notice";
import FoldedPostListSection from "./FoldedPostListSection";
import { PATHS } from "@src/constants/paths";
import { Link } from "react-router-dom";

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
      <FoldedPostListSection />
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
        <Link
          to={PATHS.MYPAGE}
          className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-base-300 hover:scale-110 relative group transition-transform duration-300"
        >
          <img
            src={profile}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black rounded-full opacity-0 group-hover:opacity-65 transition-opacity">
            <img src={person} className="w-7 h-7" />
          </div>
        </Link>
      </div>
    </div>
  );
}
