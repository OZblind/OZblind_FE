// src/components/ErrorLayout.tsx
import React from "react";

interface ErrorLayoutProps {
  children: React.ReactNode;
  title: string;
  imageSrc?: string;
  imageAlt?: string;
}

const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  children,
  title,
  imageSrc,
  imageAlt,
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* 이미지 영역 */}
      {imageSrc && (
        <div className="mb-12">
          <img
            src={imageSrc}
            alt={imageAlt || "Error Character"}
            className="h-40 w-auto max-w-sm"
          />
        </div>
      )}

      {/* 에러 제목 */}
      <h1 className="text-6xl font-bold text-gray-800 mb-12 tracking-wide text-center">
        {title}
      </h1>

      {/* 버튼들 */}
      <div className="flex flex-col sm:flex-row gap-4">{children}</div>
    </div>
  );
};

export default ErrorLayout;
