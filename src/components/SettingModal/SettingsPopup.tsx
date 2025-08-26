import type { Dispatch, SetStateAction } from "react";
import { KeySection } from "./KeySection";
import ThemeToggleSection from "./ThemeToggleSection";
import { AccountDeletionSection } from "./AccountDeletionSection";
import { useAuthStore } from "@store/authStore";

type Theme = "oz_dark" | "oz_light";

interface SettingPopupProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

export function SettingPopup({
  setIsOpen,
  theme,
  setTheme,
}: SettingPopupProps) {
  const isAuthenticated = useAuthStore((s) => Boolean(s.tokens.accessToken));

  return (
    <div className="relative bg-base-200 rounded-md p-6 max-w-md w-full">
      {isAuthenticated && (
        <button
          className="absolute top-4 right-4 px-4 text-base-content py-2 rounded-full hover:bg-base-300 transition"
          onClick={() => {
            if (!isAuthenticated) return;
            setIsOpen(false);
          }}
        >
          X
        </button>
      )}
      <div className="font-thin">설정</div>
      <ThemeToggleSection theme={theme} setTheme={setTheme} />
      <KeySection />
      {isAuthenticated && <AccountDeletionSection />}
    </div>
  );
}
