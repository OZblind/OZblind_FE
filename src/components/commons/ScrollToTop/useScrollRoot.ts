import { useContext } from "react";
import { ScrollRootContext } from "./scroll-root-store";

export function useScrollRoot() {
  const ctx = useContext(ScrollRootContext);
  if (!ctx)
    throw new Error("useScrollRoot must be used within <ScrollRootProvider>");
  return ctx;
}
