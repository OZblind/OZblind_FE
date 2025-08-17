import { useEffect, useState } from "react";
import { SidebarOpen } from "./SidebarOpen";
import { SidebarFolded } from "./SidebarFolded";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [userClosed, setUserClosed] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1200px)");

    // 미디어 쿼리 변화 시 호출
    const handleChange = (e: MediaQueryListEvent) => {
      setIsOpen(!e.matches || !userClosed);
    };

    // 초기값 세팅
    setIsOpen(!mql.matches || !userClosed);

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [userClosed]);

  const toggleSidebar = (open: boolean) => {
    // 사용자가 아이콘으로 사이드 바를 닫은 경우 닫힘 상태를 고정, 다시 연 경우 고정 해제
    setIsOpen(open);
    if (!open) {
      setUserClosed(true);
    } else {
      setUserClosed(false);
    }
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
