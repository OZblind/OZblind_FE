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
  // 동그란 원에 이미지가 완전히 맞게 들어가도록 수정
  const ErrorImage = imageSrc && (
    <div className="mb-12 flex justify-center w-full">
      <div className="w-40 h-40 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
        <img
          src={imageSrc}
          alt={imageAlt ?? "에러 관련 이미지"}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="flex flex-col items-center justify-center max-w-2xl text-center">
        {ErrorImage}

        {/* 에러 제목 */}
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4 tracking-wide">
          {title}
        </h1>

        {/* 설명 텍스트 (선택사항) */}
        {description && (
          <p className="text-lg text-foreground mb-8 max-w-md">{description}</p>
        )}

        {/* 액션 버튼들 */}
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
};

export default ErrorLayout;
