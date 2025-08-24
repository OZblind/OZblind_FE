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
  position: PositionValue; // 커밋된 값(읽기 전용처럼 취급)
  cohort: number; // 커밋된 값(읽기 전용처럼 취급)
  onChangePosition: (v: PositionValue) => void;
  onChangeCohort: (v: number) => void;
  onReset?: () => void; // (옵션) 외부 초기화 버튼이 따로 있을 때만 사용
  onApply?: (next: { pos: PositionValue; cohort: number } | null) => void;
  onRequestClose: () => void; // 닫힘
  // (선택) 내부 초기화 기본값 — 없으면 back/11로 처리
  defaultPosition?: PositionValue;
  defaultCohort?: number;
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
  // onReset,           // 외부 상태를 즉시 바꾸지 않도록 이 컴포넌트에서는 호출하지 않음
  onApply,
  onRequestClose,
  defaultPosition = "back",
  defaultCohort = 11,
}: Props) {
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // 내부 draft 상태
  const [draftPosition, setDraftPosition] = useState<PositionValue>(position);
  const [draftCohort, setDraftCohort] = useState<number>(cohort);

  // 팝오버가 열릴 때마다 현재 커밋 값으로 draft 초기화
  useEffect(() => {
    if (open) {
      setDraftPosition(position);
      setDraftCohort(cohort);
    }
  }, [open, position, cohort]);

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
  }, [open, anchorRef, draftPosition, draftCohort]);

  // 바깥 클릭 / ESC 닫기 (적용 없음 = draft 폐기)
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

  // 창/스크롤 등 닫기
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
    // 부모로 최신 draft 값 전달 → 적용
    onApply?.({ pos: draftPosition, cohort: draftCohort });
    // 내부 표시 상태도 동기화 (선택)
    onChangePosition(draftPosition);
    onChangeCohort(draftCohort);
    onRequestClose();
  }, [
    draftPosition,
    draftCohort,
    onApply,
    onChangePosition,
    onChangeCohort,
    onRequestClose,
  ]);

  const handleClear = useCallback(() => {
    // 전체 보기(필터 미적용)
    onApply?.(null);
    onRequestClose();
  }, [onApply, onRequestClose]);

  // 초기화는 draft만 리셋 (외부 상태는 건들지 않음)
  const handleReset = useCallback(() => {
    setDraftPosition(defaultPosition);
    setDraftCohort(defaultCohort);
  }, [defaultPosition, defaultCohort]);

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
        <PositionRadio value={draftPosition} onChange={setDraftPosition} />

        <div className="mt-8">
          <CohortSlider
            value={draftCohort}
            min={1}
            max={20}
            onChange={setDraftCohort}
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-ghost btn-sm mr-auto"
          >
            필터 해제
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-ghost btn-sm"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn btn-primary btn-sm text-white"
          >
            적용
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(node, document.body);
}
