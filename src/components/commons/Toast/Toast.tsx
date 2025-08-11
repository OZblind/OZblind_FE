import { useEffect, useState } from "react";
import Success from "@assets/images/success-toast.svg";
import Error from "@assets/images/error-toast.svg";
import Warning from "@assets/images/warning-toast.svg";
import Info from "@assets/images/info-toast.svg";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  /** 전체 노출 시간(ms). (durationMs - 300ms)에 fade-out 시작 */
  durationMs?: number;
}

export default function Toast({
  message,
  type = "success",
  durationMs = 2500,
}: ToastProps) {
  const iconMap = {
    success: Success,
    error: Error,
    warning: Warning,
    info: Info,
  } as const;

  const altMap = {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  } as const;

  const Icon = iconMap[type];

  // 입장/퇴장 트리거
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // enter: 첫 렌더 다음 프레임에 전환 시작
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // leave: (durationMs - 300ms)에 out 시작
  useEffect(() => {
    const leaveDelay = Math.max(0, durationMs - 300);
    const t = window.setTimeout(() => setLeaving(true), leaveDelay);
    return () => window.clearTimeout(t);
  }, [durationMs]);

  const animClass =
    entered && !leaving
      ? "opacity-100 translate-y-0"
      : "opacity-0 -translate-y-2";

  return (
    <div
      className={[
        "bg-base-200/90 text-primary-content flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-xl shadow-lg h-14 md:h-16 pointer-events-auto w-full md:w-fit max-w-full md:max-w-sm transition-all duration-300 transform",
        animClass,
      ].join(" ")}
    >
      {/* 아이콘 영역 */}
      <div className="flex-shrink-0">
        <img
          src={Icon}
          alt={altMap[type]}
          className="w-8 h-8 md:w-10 md:h-10"
        />
      </div>

      {/* 텍스트 영역 */}
      <div className="text-xs md:text-sm font-medium leading-relaxed break-words">
        {message}
      </div>
    </div>
  );
}
