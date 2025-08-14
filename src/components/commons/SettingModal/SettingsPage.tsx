import type { Dispatch, SetStateAction } from "react";
import { SettingPopup } from "./SettingsPopup";

type Theme = "oz_dark" | "oz_light";

interface SettingsPageProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

export function SettingsPage({
  isOpen,
  setIsOpen,
  theme,
  setTheme,
}: SettingsPageProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex justify-center items-center z-[2000]">
          <SettingPopup
            setIsOpen={setIsOpen}
            theme={theme}
            setTheme={setTheme}
          />
        </div>
      )}
    </>
  );
}
