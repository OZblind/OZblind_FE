import { useEffect, useState } from "react";
import { SidebarOpen } from "./SidebarOpen";
import { SidebarFolded } from "./SidebarFolded";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  // 창 크기에 따른 사이드 바 열림 여부
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1200) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize(); // 첫 렌더링 시 실행
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`
        h-screen overflow-hidden
        transition-all duration-200 ease-in-out
        ${isOpen ? "w-[300px]" : "w-[60px]"}
      `}
    >
      {isOpen ? (
        <SidebarOpen onToggle={() => setIsOpen(false)} />
      ) : (
        <SidebarFolded onToggle={() => setIsOpen(true)} />
      )}
    </div>
  );
}
