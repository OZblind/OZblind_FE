import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

export type Breakpoint = { maxWidth: number; size: number };

type ElementRefLike<T extends HTMLElement = HTMLElement> =
  | RefObject<T | null>
  | { current: T | null };

export type UseResponsivePageSizeOptions = {
  /**
   * 고정 개수 우선. 지정하면 반응형 로직은 무시됩니다.
   */
  constant?: number;
  /**
   * 반응형 표. 작은 maxWidth부터 큰 값 순으로 정렬 가정.
   */
  breakpoints?: Breakpoint[];
  /**
   * 컨테이너 기준으로 계산하고 싶으면 전달. 없으면 window.innerWidth 사용.
   */
  containerRef?: ElementRefLike;
  /**
   * true면 "첫 계산값"을 세션 동안 고정합니다(리사이즈 무시).
   */
  fixOnFirst?: boolean;
};

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { maxWidth: 480, size: 10 },
  { maxWidth: 768, size: 15 },
  { maxWidth: 1024, size: 20 },
  { maxWidth: Infinity, size: 30 },
];

function pickByWidth(width: number, table: Breakpoint[]) {
  for (const row of table) {
    if (width <= row.maxWidth) return row.size;
  }
  return table[table.length - 1]?.size ?? 20;
}

export function useResponsivePageSize({
  constant,
  breakpoints = DEFAULT_BREAKPOINTS,
  containerRef,
  fixOnFirst = false,
}: UseResponsivePageSizeOptions = {}) {
  const isConstant = useMemo(() => typeof constant === "number", [constant]);
  const fixedRef = useRef<number | null>(null);

  // SSR 안전가드: window가 없는 환경에서도 폭 계산 시 오류 방지
  const getWidth = () => {
    const w =
      containerRef?.current?.clientWidth ??
      (typeof window !== "undefined" ? window.innerWidth : 1024);
    return w;
  };

  const compute = () =>
    isConstant ? (constant as number) : pickByWidth(getWidth(), breakpoints);

  const [size, setSize] = useState<number>(() => {
    const initial = compute();
    if (fixOnFirst) fixedRef.current = initial;
    return initial;
  });

  useEffect(() => {
    if (isConstant || fixOnFirst) return;

    const onResize = () => setSize(compute());

    // SSR 안전가드
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConstant, fixOnFirst, breakpoints, containerRef?.current]);

  // fixOnFirst가 true면 첫 계산값을 계속 사용
  useEffect(() => {
    if (!fixOnFirst) return;
    if (fixedRef.current == null) fixedRef.current = compute();
    setSize(fixedRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixOnFirst]);

  return size;
}
