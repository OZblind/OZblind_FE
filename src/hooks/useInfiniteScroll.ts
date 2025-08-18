import { useCallback, useEffect, useRef } from "react";

export type UseInfiniteScrollOptions = {
  root?: Element | Document | null;
  rootMargin?: string;
  /** 단일 값 또는 배열 모두 지원 */
  threshold?: number | number[];
  /**
   * 교차 시 호출되는 핸들러.
   * Promise를 반환하면 resolve될 때까지 중복 호출을 잠금(in-flight lock).
   */
  onIntersect: () => void | Promise<void>;
  /** 로딩 중/더 없음 등 외부 가드 */
  disabled?: boolean;
};

export type UseInfiniteScrollReturn = {
  /** 관찰 대상(센티넬) ref 콜백 */
  sentinelRef: (el: HTMLDivElement | null) => void;
};

export function useInfiniteScroll({
  root = null,
  rootMargin = "1000px 0px",
  threshold = 0,
  disabled = false,
  onIntersect,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 최신 콜백 유지
  const latestCbRef = useRef(onIntersect);
  useEffect(() => {
    latestCbRef.current = onIntersect;
  }, [onIntersect]);

  // 비동기/연속 교차 중복 호출 방지용 락
  const inFlightRef = useRef(false);

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    cleanupObserver();
    if (disabled) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (disabled) return;

        // 하나라도 교차하면 트리거
        const intersecting = entries.some(
          (e) => e.isIntersecting && e.intersectionRatio > 0
        );
        if (!intersecting) return;

        if (inFlightRef.current) return;
        inFlightRef.current = true;

        const run = async () => {
          try {
            // Promise면 대기, 아니면 즉시 반환
            await Promise.resolve(latestCbRef.current?.());
          } finally {
            // 다음 페인트 이후 락 해제(진동 방지)
            requestAnimationFrame(() => {
              inFlightRef.current = false;
            });
          }
        };

        void run();
      },
      { root, rootMargin, threshold }
    );

    observerRef.current = obs;

    const el = targetRef.current;
    if (el) obs.observe(el);

    return () => {
      cleanupObserver();
    };
  }, [root, rootMargin, threshold, disabled, cleanupObserver]);

  // 대상 노드 등록 ref
  const sentinelRef = useCallback(
    (el: HTMLDivElement | null) => {
      const prev = targetRef.current;
      const obs = observerRef.current;

      if (prev && obs) {
        try {
          obs.unobserve(prev);
        } catch {
          // noop
        }
      }
      targetRef.current = el;

      if (el && obs && !disabled) {
        obs.observe(el);
      }
    },
    [disabled]
  );

  return { sentinelRef };
}
