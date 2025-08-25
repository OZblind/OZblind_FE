import {
  BASE_RESET,
  VIEWER_CSS,
  PRISM_LIGHT,
  PRISM_DARK,
  LIGHT_OVERRIDES,
  DARK_OVERRIDES,
} from "./css";

export type Mode = "light" | "dark";

export type StyleRefs = {
  base?: HTMLStyleElement;
  viewer?: HTMLStyleElement;
  prismLight?: HTMLStyleElement;
  prismDark?: HTMLStyleElement;
  themeLight?: HTMLStyleElement;
  themeDark?: HTMLStyleElement;
};

export const buildStyle = (css: string) => {
  const s = document.createElement("style");
  s.textContent = css;
  return s;
};

export const getMode = (): Mode => {
  const attr = (
    document.documentElement.getAttribute("data-theme") || ""
  ).toLowerCase();
  return attr.includes("dark") ? "dark" : "light";
};

/** host: 섀도우를 붙일 실제 div */
export function initShadow(host: HTMLElement) {
  const shadow = host.attachShadow({ mode: "open" });
  const refs: StyleRefs = {};
  refs.base = buildStyle(BASE_RESET);
  refs.viewer = buildStyle(VIEWER_CSS);
  shadow.append(refs.base, refs.viewer);
  return { shadow, refs };
}

export function applyMode(shadow: ShadowRoot, refs: StyleRefs, mode: Mode) {
  // 기존 라이트/다크 스타일 제거
  refs.prismLight?.remove();
  refs.prismDark?.remove();
  refs.themeLight?.remove();
  refs.themeDark?.remove();

  if (mode === "dark") {
    if (!refs.prismDark) refs.prismDark = buildStyle(PRISM_DARK);
    if (!refs.themeDark) refs.themeDark = buildStyle(DARK_OVERRIDES);
    shadow.append(refs.prismDark, refs.themeDark);
  } else {
    if (!refs.prismLight) refs.prismLight = buildStyle(PRISM_LIGHT);
    if (!refs.themeLight) refs.themeLight = buildStyle(LIGHT_OVERRIDES);
    shadow.append(refs.prismLight, refs.themeLight);
  }
}

/** data-theme 변경을 감지하고 테마를 적용. 반환값으로 해제 함수 제공 */
export function observeRootTheme(shadow: ShadowRoot, refs: StyleRefs) {
  const update = () => applyMode(shadow, refs, getMode());
  update();
  const obs = new MutationObserver(update);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => obs.disconnect();
}
