import { useState } from "react";
import { SidebarOpen } from "./SidebarOpen";
import { SidebarFolded } from "./SidebarFolded";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

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
