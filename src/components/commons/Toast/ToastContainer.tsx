import type { ReactNode } from "react";

interface ToastContainerProps {
  children: ReactNode;
}

export default function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="fixed top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-[5000] pointer-events-none px-6 w-full md:w-auto">
      <div className="flex flex-col gap-2 md:gap-3 items-center">
        {children}
      </div>
    </div>
  );
}
