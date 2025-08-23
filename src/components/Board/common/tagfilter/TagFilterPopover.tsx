import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import PositionRadio, { type PositionValue } from "./PositionRadio";
import CohortSlider from "./CohortSlider";

type Props = {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  position: PositionValue;
  cohort: number;
  onChangePosition: (v: PositionValue) => void;
  onChangeCohort: (v: number) => void;
  onReset?: () => void; // 전체 초기화(옵션)
  onApply?: () => void; // 적용 버튼(옵션)
  onRequestClose: () => void; // 바깥 클릭/ESC/스크롤 등 닫힘
};

const GAP = 8;
const MARGIN = 12;

export default function TagFilterPopover({
  open,
  anchorRef,
  position,
  cohort,
  onChangePosition,
  onChangeCohort,
  onReset,
  onApply,
  onRequestClose,
}: Props) {
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // 위치 계산
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const id = requestAnimationFrame(() => {
      const a = anchorRef.current!;
      const pr = popRef.current?.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const vw = window.innerWidth;
      const width = pr?.width ?? 280;

      let left = ar.left;
      left = Math.max(MARGIN, Math.min(left, vw - MARGIN - width));
      const top = ar.bottom + GAP;

      setPos({ top, left });
    });
    return () => cancelAnimationFrame(id);
  }, [open, anchorRef, position, cohort]);

  // 바깥 클릭 / ESC 닫기
  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current) return;
      if (!popRef.current.contains(t) && !anchorRef.current?.contains(t)) {
        onRequestClose();
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose();
    };

    document.addEventListener("mousedown", onDoc, true);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc, true);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onRequestClose, anchorRef]);

  // 창/스크롤/휠/터치/탭전환/앵커소실 → 닫기
  useEffect(() => {
    if (!open) return;
    const close = () => onRequestClose();
    const opts = { passive: true } as const;

    window.addEventListener("resize", close, opts);
    window.addEventListener("orientationchange", close, opts);
    window.addEventListener("scroll", close, opts);
    window.addEventListener("wheel", close, opts);
    window.addEventListener("touchmove", close, opts);
    const onVisibility = () => document.hidden && close();
    document.addEventListener("visibilitychange", onVisibility);

    const mo = new MutationObserver(() => {
      if (!anchorRef.current || !document.body.contains(anchorRef.current))
        close();
    });
    if (anchorRef.current) {
      mo.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("orientationchange", close);
      window.removeEventListener("scroll", close);
      window.removeEventListener("wheel", close);
      window.removeEventListener("touchmove", close);
      document.removeEventListener("visibilitychange", onVisibility);
      mo.disconnect();
    };
  }, [open, onRequestClose, anchorRef]);

  const handleApply = useCallback(() => {
    onApply?.();
    onRequestClose();
  }, [onApply, onRequestClose]);

  if (!open || !anchorRef.current) return null;

  const node = (
    <>
      {/* 오버레이 */}
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/0 cursor-default"
        onMouseDown={onRequestClose}
      />
      <div
        ref={popRef}
        style={{
          position: "fixed",
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          zIndex: 50,
        }}
        className="rounded-2xl shadow-xl border border-base-300 bg-base-100 p-3 w-[280px]"
      >
        <div className="px-1 text-xs text-base-content/60 mb-2">
          포지션 필터
        </div>
        <PositionRadio value={position} onChange={onChangePosition} />

        <div className="mt-8">
          <CohortSlider
            value={cohort}
            min={1}
            max={20}
            onChange={onChangeCohort}
          />
        </div>

        {(onApply || onReset) && (
          <div className="mt-4 flex items-center justify-end gap-2">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="btn btn-ghost btn-sm"
              >
                초기화
              </button>
            )}
            {onApply && (
              <button
                type="button"
                onClick={handleApply}
                className="btn btn-primary btn-sm text-white"
              >
                적용
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );

  return createPortal(node, document.body);
}
