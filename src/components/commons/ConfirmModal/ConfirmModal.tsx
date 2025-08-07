import { useRef, useEffect } from "react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  cancelLabel = "취소",
  confirmLabel = "확인",
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Escape 키 누르면 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // 모달 오픈 시 스크롤 바 숨기기
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  // 모달 외 클릭 시 모달 닫기
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[3000]"
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className="bg-primary-content rounded-2xl shadow-2xl w-full max-w-md mx-auto z-[4000] animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 내용 */}
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-accent-content mb-3 leading-relaxed break-keep">
            {title}
          </h2>

          {description && (
            <p className="text-sm text-gray-700 mb-6 leading-relaxed break-keep whitespace-pre-wrap">
              {description}
            </p>
          )}

          {/* 버튼 영역 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl outline-none border border-accent-content bg-transparent text-accent-content font-medium hover:bg-accent-content hover:border-transparent hover:text-primary-content focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-xl outline-none bg-primary text-primary-content font-medium hover:bg-secondary focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
