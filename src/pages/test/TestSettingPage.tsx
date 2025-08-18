import { SettingsPage } from "@src/components/SettingModal/SettingsPage";
import { ThemeInitializer } from "@src/components/SettingModal/ThemeInitializer";
import { useState } from "react";

export default function TestSettingPage() {
  const [settingOpen, setSettingIsOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"oz_dark" | "oz_light">("oz_dark");
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <button
        type="button"
        onClick={() => setSettingIsOpen(true)}
        className="rounded-full border w-40 h-40 text-center"
      >
        프로필
      </button>
      <SettingsPage
        isOpen={settingOpen}
        setIsOpen={setSettingIsOpen}
        theme={theme}
        setTheme={setTheme}
      />
      <ThemeInitializer setTheme={setTheme} />
    </div>
  );
}
