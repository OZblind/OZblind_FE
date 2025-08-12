import { useState } from "react";
import { SettingPopup } from "./SettingsPopup";

export function SettingsPage() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex justify-center items-center z-[2000]">
          <SettingPopup setIsOpen={setIsOpen} />
        </div>
      )}
    </>
  );
}
