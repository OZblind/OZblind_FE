import type { Dispatch, SetStateAction } from "react";
import { SettingPopup } from "./SettingsPopup";

type SettingsPageProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export function SettingsPage({ isOpen, setIsOpen }: SettingsPageProps) {
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
