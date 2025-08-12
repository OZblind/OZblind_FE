import type { Dispatch, SetStateAction } from "react";
import { KeySection } from "./KeySection";
import ThemeToggleButton from "./ThemeToggleSection";
import { AccountDeletionSection } from "./AccountDeletionSection";

type SettingPopupProps = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export function SettingPopup({ setIsOpen }: SettingPopupProps) {
  return (
    <div className="relative bg-base-200 rounded-md p-6 max-w-md w-full h-[500px]">
      <button
        className="absolute top-4 right-4 px-4 text-base-content py-2 rounded-full hover:bg-base-300 transition"
        onClick={() => setIsOpen(false)}
      >
        X
      </button>
      <div className="font-thin">설정</div>
      <ThemeToggleButton />
      <KeySection />
      <AccountDeletionSection />
    </div>
  );
}
