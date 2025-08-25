import { useEffect } from "react";
import { useScrollRoot } from "./useScrollRoot";

/** Outlet 스크롤 잠금/해제 헬퍼(내부 스크롤 루트가 활성일 때 바깥 스크롤 방지) */
export default function LockOutletScrollWhenChildRoot({
  elRef,
}: {
  elRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { root } = useScrollRoot();
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const shouldLock = root && el !== root;
    const prev = el.style.overflowY;
    el.style.overflowY = shouldLock ? "hidden" : "auto";
    return () => {
      el.style.overflowY = prev || "auto";
    };
  }, [root, elRef]);
  return null;
}
