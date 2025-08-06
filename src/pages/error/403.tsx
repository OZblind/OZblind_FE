import React from "react";
import ErrorLayout from "../../components/ErrorLayout";

const ForbiddenPage: React.FC = () => {
  const handleTryAgain = (): void => {
    window.location.reload();
  };

  const handleGoHome = (): void => {
    window.location.href = "/";
  };

  return (
    <ErrorLayout
      title="403 Forbidden"
      imageSrc="/assets/images/error/403.png"
      imageAlt="403 접근 금지 캐릭터들"
      description="죄송합니다. 이 페이지에 접근할 권한이 없습니다."
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={handleTryAgain}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md text-base font-medium transition-colors duration-300 tracking-wide"
        >
          다시 시도
        </button>
        <button
          type="button"
          onClick={handleGoHome}
          className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-md text-base font-medium transition-colors duration-300 tracking-wide"
        >
          홈으로 이동
        </button>
      </div>
    </ErrorLayout>
  );
};

export default ForbiddenPage;
