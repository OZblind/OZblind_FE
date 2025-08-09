import Success from "@assets/images/success-toast.svg";
import Error from "@assets/images/error-toast.svg";
import Warning from "@assets/images/warning-toast.svg";
import Info from "@assets/images/info-toast.svg";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
}

export default function Toast({ message, type = "success" }: ToastProps) {
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

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-base-200/90 text-primary-content flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-xl shadow-lg h-14 md:h-16 pointer-events-auto animate-in slide-in-from-top-2 fade-in-0 duration-300 w-full md:w-fit max-w-full md:max-w-sm"
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
