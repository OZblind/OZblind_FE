import CheckIcon from "../../../assets/images/success-check.png";

export interface ToastProps {
  message: string;
  type?: "success"; // | 'error' | 'warning' | 'info'
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="bg-base-200/90 text-primary-content flex items-center gap-4 px-4 py-3 rounded-xl shadow-lg min-w-max max-w-sm h-16 pointer-events-auto animate-in slide-in-from-top-2 fade-in-0 duration-300">
      {/* 아이콘 영역 */}
      <div className="flex-shrink-0">
        <img src={CheckIcon} alt="Success" className="w-10 h-10" />
      </div>

      {/* 텍스트 영역 */}
      <div className="text-sm font-medium leading-relaxed break-words">
        {message}
      </div>
    </div>
  );
}
