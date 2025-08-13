import type { Dispatch, SetStateAction } from "react";
import { KeySection } from "./KeySection";
import ThemeToggleSection from "./ThemeToggleSection";
import { AccountDeletionSection } from "./AccountDeletionSection";

type Theme = "oz_dark" | "oz_light";

type SettingPopupProps = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

export function SettingPopup({
  setIsOpen,
  theme,
  setTheme,
}: SettingPopupProps) {
  return (
    <div className="relative bg-base-200 rounded-md p-6 max-w-md w-full h-[500px]">
      <button
        className="absolute top-4 right-4 px-4 text-base-content py-2 rounded-full hover:bg-base-300 transition"
        onClick={() => setIsOpen(false)}
      >
        X
      </button>
      <div className="font-thin">설정</div>
      <ThemeToggleSection theme={theme} setTheme={setTheme} />
      <KeySection />
      <AccountDeletionSection />
    </div>
  );
}
