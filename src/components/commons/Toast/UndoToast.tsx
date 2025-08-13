import React, { useEffect, useState } from "react";
import Warning from "@assets/images/warning-toast.svg";

interface UndoToastProps {
  message: string;
  isVisible: boolean;
  onUndo: () => void;
  onClose: () => void;
  durationMs?: number;
}

const UndoToast: React.FC<UndoToastProps> = ({
  message,
  isVisible,
  onUndo,
  onClose,
  durationMs = 5000,
}) => {
  const [progress, setProgress] = useState(100);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // isVisible이 false가 될 때 모든 상태 초기화
  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      setEntered(false);
      setLeaving(false);
    }
  }, [isVisible]);

  // 입장 애니메이션
  useEffect(() => {
    if (isVisible) {
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [isVisible]);

  // 프로그레스 바 & 자동 닫기
  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, durationMs - elapsed);
      const progressValue = (remaining / durationMs) * 100;

      setProgress(progressValue);

      if (remaining <= 300) {
        setLeaving(true);
      }

      if (remaining <= 0) {
        onClose();
        return;
      }

      requestAnimationFrame(updateProgress);
    };

    requestAnimationFrame(updateProgress);
  }, [isVisible, durationMs, onClose]);

  const handleUndo = () => {
    setLeaving(true);
    setTimeout(() => {
      onUndo();
    }, 300);
  };

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const animClass =
    entered && !leaving
      ? "opacity-100 translate-y-0"
      : "opacity-0 -translate-y-2";

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={[
          "bg-base-200/90 text-primary-content flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-xl shadow-lg pointer-events-auto w-fit max-w-sm transition-all duration-300 transform relative overflow-hidden",
          animClass,
        ].join(" ")}
      >
        {/* 아이콘 영역 */}
        <div className="flex-shrink-0">
          <img
            src={Warning}
            alt="Warning"
            className="w-8 h-8 md:w-10 md:h-10"
          />
        </div>

        {/* 텍스트 영역 */}
        <div className="text-xs md:text-sm font-medium leading-relaxed break-words flex-1">
          {message}
        </div>

        {/* 버튼 영역 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 실행 취소 버튼 */}
          <button
            onClick={handleUndo}
            className="px-3 py-1 bg-warning hover:bg-warning/80 text-warning-content rounded text-xs font-bold transition-colors"
          >
            실행 취소
          </button>

          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="text-current hover:opacity-80 transition-opacity p-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 프로그레스 바 */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
          <div
            className="h-full bg-warning transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UndoToast;
