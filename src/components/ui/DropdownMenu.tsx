import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export type DropdownItem = {
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** a11y: 화면리더용 설명 필요시 */
  ariaLabel?: string;
};

type Props = {
  items: DropdownItem[];
  trigger: React.ReactNode; // 버튼 아이콘 등
  align?: "start" | "end";
  className?: string; // 추가 래퍼 클래스
  menuClassName?: string; // 메뉴 박스 커스텀
  triggerAriaLabel?: string;
};

export default function DropdownMenu({
  items,
  trigger,
  align = "end",
  className,
  menuClassName,
  triggerAriaLabel = "menu",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);

  // 바깥 클릭으로 닫기
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // 열릴 때 첫 항목 포커스
  useEffect(() => {
    if (open) {
      // 약간의 틱 뒤 포커스
      const t = setTimeout(() => firstBtnRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const dropdownAlignClass =
    align === "end" ? "dropdown-end" : "dropdown-start";

  return (
    <div
      ref={rootRef}
      className={clsx("dropdown", dropdownAlignClass, className)}
    >
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        aria-label={triggerAriaLabel}
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>

      <ul
        className={clsx(
          "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44",
          open ? "block" : "hidden",
          menuClassName
        )}
        role="menu"
        aria-label="드롭다운 메뉴"
      >
        {items.map((it, idx) => (
          <li key={idx} role="none">
            <button
              ref={idx === 0 ? firstBtnRef : undefined}
              role="menuitem"
              type="button"
              className={clsx(
                "flex items-center gap-2",
                it.danger && "text-error",
                it.disabled && "opacity-50 pointer-events-none"
              )}
              aria-label={it.ariaLabel ?? it.label}
              onClick={() => {
                if (it.disabled) return;
                it.onSelect();
                // 액션 수행 후 닫기
                setOpen(false);
              }}
            >
              {it.icon}
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
