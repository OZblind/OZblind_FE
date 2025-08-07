import CheckIcon from "../../../assets/images/success-check.png";

export interface ToastProps {
  message: string;
  type?: "success"; // | 'error' | 'warning' | 'info'
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="bg-base-200/90 text-primary-content flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-xl shadow-lg h-14 md:h-16 pointer-events-auto animate-in slide-in-from-top-2 fade-in-0 duration-300 w-full md:w-fit max-w-full md:max-w-sm">
      {/* 아이콘 영역 */}
      <div className="flex-shrink-0">
        <img
          src={CheckIcon}
          alt="Success"
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
