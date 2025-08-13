import { useCallback, useEffect, useRef } from "react";

export type UseInfiniteScrollOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  disabled?: boolean;
  onIntersect: () => void;
};

export type UseInfiniteScrollReturn = {
  sentinelRef: (el: HTMLDivElement | null) => void;
};

/**
 * IntersectionObserver 기반 무한 스크롤 훅
 * - root 변경, disabled 변경에 안전
 * - 최신 onIntersect 유지(closure 문제 방지)
 * - 동일 프레임/연속 교차 중복 호출 방지
 */
export function useInfiniteScroll({
  root = null,
  rootMargin = "600px 0px",
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

  // 동일 프레임/진동 방지용 락
  const pendingRef = useRef(false);

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // 옵저버 생성/재생성
  useEffect(() => {
    cleanupObserver();

    if (disabled) return; // 로딩 중/더 없음 등 가드

    const obs = new IntersectionObserver(
      (entries) => {
        if (disabled) return;
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          // 연속 교차로 인한 중복 호출 방지
          if (pendingRef.current) return;
          pendingRef.current = true;
          // requestAnimationFrame으로 1프레임 뒤에 해제(브라우저 배치 타이밍 안정화)
          queueMicrotask(() => {
            try {
              latestCbRef.current?.();
            } finally {
              // 다음 Paint(브라우저가 화면에 픽셀을 실제로 그리는 시점) 이후에 풀어주기
              requestAnimationFrame(() => {
                pendingRef.current = false;
              });
            }
          });
        }
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

      // 이전 타겟 unobserve
      if (prev && obs) {
        try {
          obs.unobserve(prev);
        } catch {
          // noop
        }
      }
      targetRef.current = el;

      // 새로운 타겟 observe
      if (el && obs && !disabled) {
        obs.observe(el);
      }
    },
    [disabled]
  );

  return { sentinelRef };
}
