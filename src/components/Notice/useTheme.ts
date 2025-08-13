import { useEffect, useState } from "react";

/** DaisyUI: <html data-theme="oz_dark" | "oz_light"> 를 구독 */
export function useTheme() {
  const get = () =>
    (document.documentElement.dataset.theme ?? "").toLowerCase();
  const [theme, setTheme] = useState<string>(get());

  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setTheme(get()));
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return { theme, isDark: theme.includes("dark") };
}
