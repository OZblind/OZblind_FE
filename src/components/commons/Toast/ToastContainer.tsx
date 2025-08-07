import type { ReactNode } from "react";

interface ToastContainerProps {
  children: ReactNode;
}

export default function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[5000] pointer-events-none">
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
