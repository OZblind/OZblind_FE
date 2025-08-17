import { useEffect, useState } from "react";
import { SidebarOpen } from "./SidebarOpen";
import { SidebarFolded } from "./SidebarFolded";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [userClosed, setUserClosed] = useState(false);

  useEffect(() => {
    // 1200px 이하로는 무조건 사이드바가 접히도록, 사용자가 닫은 상태가 아니라면 열림
    const handleResize = () => {
      if (window.innerWidth <= 1200) {
        setIsOpen(false);
      } else {
        if (!userClosed) {
          setIsOpen(true);
        }
      }
    };

    handleResize(); // 처음 페이지 로드 시 창 크기에 맞춰 사이드바 상태를 세팅
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
