import { useEffect, useRef } from "react";
import SortRadio from "./SortRadio";
import type { SortValue } from "../../../../types/sort";

export default function SortRadioPopover({
  open,
  anchorRef,
  value,
  onChange,
  onRequestClose,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  value: SortValue;
  onChange: (v: SortValue) => void;
  onRequestClose: () => void;
}) {
  const popRef = useRef<HTMLDivElement>(null);

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
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onRequestClose, anchorRef]);

  if (!open || !anchorRef.current) return null;

  const r = anchorRef.current.getBoundingClientRect();

  return (
    <div
      ref={popRef}
      style={{
        position: "fixed",
        top: r.bottom + 8,
        left: Math.max(12, r.left - 8),
        zIndex: 50,
      }}
      className="rounded-2xl shadow-xl border border-base-300 bg-base-100 p-3 w-[180px]"
    >
      <SortRadio
        value={value}
        onChange={(v) => {
          onChange(v);
          onRequestClose();
        }}
      />
    </div>
  );
}
