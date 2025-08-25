import { createContext } from "react";

export type ScrollRoot = HTMLElement | null;
export type ScrollRootCtx = {
  root: ScrollRoot;
  setRoot: (el: ScrollRoot) => void;
};

export const ScrollRootContext = createContext<ScrollRootCtx | null>(null);
