import React, { useEffect, useState, useRef } from "react";

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
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null); // rAF ID 보관용

  // 입장 애니메이션
  useEffect(() => {
    if (!isVisible) return; // Early return 방식

    setIsAnimating(true);
    setProgress(100);
    startTimeRef.current = Date.now();
  }, [isVisible]);

  // 프로그레스 바 & 자동 닫기 - 메모리 누수 해결
  useEffect(() => {
    if (!isVisible) {
      // 보이는 상태가 아니면 돌고 있는 rAF를 중단
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, durationMs - elapsed);
      const newProgress = (remaining / durationMs) * 100;

      setProgress(newProgress);

      if (remaining <= 0) {
        onClose();
        return;
      }

      // 다음 프레임 예약하면서 ID 저장
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    // 최초 프레임 예약하면서 ID 저장
    rafRef.current = requestAnimationFrame(updateProgress);

    // 클린업 함수: 언마운트되거나 deps가 바뀌면 현재 예약된 rAF 취소
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isVisible, durationMs, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      onTransitionEnd={() => {
        if (!isVisible) setIsAnimating(false);
      }}
    >
      <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg px-4 py-3 max-w-md">
        {/* 메시지 */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-sm text-base-content">{message}</span>
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              className="text-primary hover:text-primary-focus text-sm font-medium"
            >
              실행 취소
            </button>
            <button
              onClick={onClose}
              className="text-neutral-content hover:text-base-content text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full bg-base-300 rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UndoToast;
