import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export type DropdownItem = {
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

type Props = {
  items: DropdownItem[];
  trigger: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  menuClassName?: string;
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        open &&
        rootRef.current &&
        !rootRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={clsx("dropdown", align === "end" && "dropdown-end", className)}
    >
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        aria-label={triggerAriaLabel}
        aria-expanded={open}
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
      >
        {items.map((it, idx) => (
          <li key={idx}>
            <button
              type="button"
              className={clsx(
                "flex items-center gap-2",
                it.danger && "text-error",
                it.disabled && "opacity-50"
              )}
              onClick={() => {
                if (it.disabled) return;
                it.onSelect();
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
