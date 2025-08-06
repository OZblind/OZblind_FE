import React from "react";

interface ErrorLayoutProps {
  title: string;
  imageSrc?: string;
  imageAlt?: string;
  description?: string;
  children: React.ReactNode;
}

const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  title,
  imageSrc,
  imageAlt,
  description,
  children,
}) => {
  // 조건부 렌더링을 JSX 밖으로 분리
  const ErrorImage = imageSrc && (
    <div className="mb-12 flex justify-center w-full">
      <img
        src={imageSrc}
        alt={imageAlt ?? "에러 관련 이미지"}
        className="h-40 w-auto max-w-sm mx-auto"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="flex flex-col items-center justify-center max-w-2xl text-center">
        {ErrorImage}

        {/* 에러 제목 */}
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4 tracking-wide drop-shadow-lg">
          {title}
        </h1>

        {/* 설명 텍스트 (선택사항) */}
        {description && (
          <p className="text-lg text-gray-200 mb-8 max-w-md drop-shadow-md">
            {description}
          </p>
        )}

        {/* 액션 버튼들 */}
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
};

export default ErrorLayout;
