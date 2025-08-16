import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import { NotificationModal } from "@components/Notice";
import { useEffect, useState } from "react";
import ProfileSection from "./ProfileSection";
import SmallProfileSection from "./SmallProfileSection";
import PostListSection from "./PostListSection";
import LogoutSection from "./LogoutSection";

export function SidebarOpen({ onToggle }: { onToggle: () => void }) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const themeIcon = useThemeIcon();
  const menuIcon = themeIcon === "oz_dark" ? icons.menu.dark : icons.menu.light;
  const notificationsIcon =
    themeIcon === "oz_dark"
      ? icons.notifications.dark
      : icons.notifications.light;

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerHeight < 730);
    };

    handleResize(); // 초기 실행
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col justify-between h-full bg-base-200 p-4">
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center">
          <NotificationModal
            open={noticeOpen}
            onClose={() => setNoticeOpen(false)}
          />
          <div className="flex justify-between w-[270px] h-[40px]">
            <button
              onClick={() => setNoticeOpen(true)}
              className="p-2 rounded-full hover:bg-base-300"
            >
              <img src={notificationsIcon} alt="notificationsIcon" />
            </button>
            <button
              onClick={onToggle}
              className="p-2 rounded-full hover:bg-base-300"
            >
              <img src={menuIcon} alt="menuIcon" />
            </button>
          </div>
          {isSmall ? <SmallProfileSection /> : <ProfileSection />}
          <PostListSection />
        </div>
      </div>
      <div>
        <LogoutSection />
        <p className="text-xs text-neutral-content">날고 싶은 거북이</p>
      </div>
    </div>
  );
}
