import React, { useEffect, useState, useRef } from "react";

interface UndoToastProps {
  message: string;
  onUndo?: () => void;
  onClose?: () => void;
  durationMs?: number;
  isVisible?: boolean;
}

const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onClose,
  durationMs = 5000,
  isVisible = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  // rAF ID 관리를 위한 ref
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 입장 애니메이션
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => setIsAnimatingIn(true), 50);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // 프로그레스 바 & 자동 닫기
  useEffect(() => {
    if (!isVisible) {
      // 보이는 상태가 아니면 돌고 있는 rAF를 중단
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    startTimeRef.current = performance.now();

    const updateProgress = (currentTime: number) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const newProgress = Math.min((elapsed / durationMs) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        onClose?.();
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

  // 컴포넌트 언마운트 시 확실한 정리
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isAnimatingIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
        {/* 메시지 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-base-content">{message}</span>
          <button
            onClick={onUndo}
            className="ml-4 px-3 py-1 bg-primary text-primary-content text-sm rounded hover:bg-primary-focus transition-colors"
          >
            실행취소
          </button>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full bg-base-200 rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UndoToast;
