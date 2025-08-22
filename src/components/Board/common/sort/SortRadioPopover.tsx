import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SortRadio from "./SortRadio";
import type { SortValue } from "@src/types/sort";

type Props = {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  value: SortValue;
  onChange: (v: SortValue) => void;
  onRequestClose: () => void;
};

const GAP = 8; // 버튼과 간격
const MARGIN = 12; // 화면 여백

export default function SortRadioPopover({
  open,
  anchorRef,
  value,
  onChange,
  onRequestClose,
}: Props) {
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // 열릴 때 1회 위치 계산
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const id = requestAnimationFrame(() => {
      const a = anchorRef.current!;
      const pr = popRef.current?.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const vw = window.innerWidth;

      const width = pr?.width ?? 200;
      // 버튼 왼쪽 라인 기준
      let left = ar.left;
      // 화면 밖으로 안 나가게 보정
      left = Math.max(MARGIN, Math.min(left, vw - MARGIN - width));
      const top = ar.bottom + GAP;

      setPos({ top, left });
    });
    return () => cancelAnimationFrame(id);
  }, [open, anchorRef, value]);

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

  // ✅ 예외사항: 창/화면/스크롤/휠/터치/탭전환/앵커소실 → 닫기
  useEffect(() => {
    if (!open) return;

    const close = () => onRequestClose();

    const opts = { passive: true } as const;

    // 창 크기/방향 변경
    window.addEventListener("resize", close, opts);
    window.addEventListener("orientationchange", close, opts);

    // 윈도우 스크롤(상위 컨테이너 overflow 영향 포함)
    window.addEventListener("scroll", close, opts);
    // 휠/터치 스크롤 제스처
    window.addEventListener("wheel", close, opts);
    window.addEventListener("touchmove", close, opts);

    // 탭 전환/숨김
    const onVisibility = () => document.hidden && close();
    document.addEventListener("visibilitychange", onVisibility);

    // 앵커가 DOM에서 사라지거나 display:none 되는 경우
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

  if (!open || !anchorRef.current) return null;

  const node = (
    <div
      ref={popRef}
      style={{
        position: "fixed",
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        zIndex: 50,
      }}
      className="rounded-2xl shadow-xl border border-base-300 bg-base-100 p-3 pr-6 w-[140px]"
    >
      <SortRadio
        layout="list"
        value={value}
        onChange={(v) => {
          onChange(v);
          onRequestClose();
        }}
      />
    </div>
  );

  // 부모의 overflow/transform 영향 제거
  return createPortal(node, document.body);
}
