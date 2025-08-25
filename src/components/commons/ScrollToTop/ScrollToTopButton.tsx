import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import { useThemeIcon } from "@src/hooks/useThemeIcon";

import arrowUpDark from "@assets/icons/icon-arrow-upward-dark.svg";
import arrowUpLight from "@assets/icons/icon-arrow-upward-light.svg";

type Props = {
  /** 스크롤 기준이 되는 엘리먼트 (없으면 window 사용) */
  root?: HTMLElement | null;
  /** 버튼 표시 임계치(px) */
  threshold?: number;
  /** 오른쪽/아래 여백 커스텀 하고 싶으면 className으로 조절 */
  className?: string;
  /** "fixed": 화면 우하단, "inline": 부모에서 위치 제어(예: sticky) */
  position?: "fixed" | "inline";
};

export default function ScrollToTopButton({
  root,
  threshold = 300,
  className,
  position = "fixed",
}: Props) {
  const themeIcon = useThemeIcon(); // "oz_dark" | "oz_light"
  const [visible, setVisible] = useState(false);

  const iconSrc = useMemo(
    () => (themeIcon === "oz_dark" ? arrowUpDark : arrowUpLight),
    [themeIcon]
  );

  const tickingRef = useRef(false);
  const targetRef = useRef<HTMLElement | (Window & typeof globalThis) | null>(
    null
  );
  const getScrollTop = useCallback(() => {
    if (root) return root.scrollTop ?? 0;
    return window.scrollY ?? window.pageYOffset ?? 0;
  }, [root]);

  const onScroll = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      tickingRef.current = false;
      const y = getScrollTop();
      setVisible(y > threshold);
    });
  }, [getScrollTop, threshold]);

  useEffect(() => {
    const t = (root as HTMLElement) ?? window;
    targetRef.current = t;
    // 초기 상태 동기화
    setVisible(getScrollTop() > threshold);

    t.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      t.removeEventListener("scroll", onScroll as EventListener);
      targetRef.current = null;
    };
  }, [root, threshold, onScroll, getScrollTop]);

  const handleClick = useCallback(() => {
    if (root) {
      root.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [root]);

  return (
    <button
      type="button"
      aria-label="맨 위로 가기"
      onClick={handleClick}
      className={clsx(
        position === "fixed" ? "fixed right-6 bottom-6" : "relative", // inline 모드에서는 부모가 위치를 책임짐
        "z-50 rounded-full shadow-xl border",
        "bg-base-100 border-base-content/20 hover:border-base-content/40",
        "transition-opacity duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "p-3",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      <img
        src={iconSrc}
        alt="맨 위로"
        className="w-6 h-6 md:w-7 md:h-7"
        draggable={false}
      />
    </button>
  );
}
