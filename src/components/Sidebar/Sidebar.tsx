import { useEffect, useState } from "react";
import { SidebarOpen } from "./SidebarOpen";
import { SidebarFolded } from "./SidebarFolded";

export default function Sidebar() {
  // 새로고침 후에도 아이콘 닫힘 상태를 우선 적용
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const savedClosed = localStorage.getItem("sidebarUserClosed") === "true";
    const mql = window.matchMedia("(max-width: 1200px)");
    if (savedClosed) return false;
    return !mql.matches;
  });

  // 사용자가 아이콘으로 사이드바를 닫았는지 추적
  const [userClosed, setUserClosed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebarUserClosed") === "true";
  });

  // matchMedia 구독
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 1200px)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!userClosed) setIsOpen(!e.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [userClosed]);

  const toggleSidebar = (open: boolean) => {
    setIsOpen(open);
    setUserClosed(!open);
    localStorage.setItem("sidebarUserClosed", String(!open));
  };

  if (isOpen === null) return null; // 초기 깜빡임 방지

  return (
    <div
      className={`
        h-screen overflow-hidden
        transition-all duration-200 ease-in-out
        ${isOpen ? "w-[300px]" : "w-[60px]"}
      `}
    >
      {isOpen ? (
        <SidebarOpen onToggle={() => toggleSidebar(false)} />
      ) : (
        <SidebarFolded onToggle={() => toggleSidebar(true)} />
      )}
    </div>
  );
}
