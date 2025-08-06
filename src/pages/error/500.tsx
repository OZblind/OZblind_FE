import React from "react";
import ErrorLayout from "../../components/ErrorLayout";

const ServerErrorPage: React.FC = () => {
  const handleTryAgain = (): void => {
    window.location.reload();
  };

  const handleGoHome = (): void => {
    window.location.href = "/";
  };

  return (
    <ErrorLayout
      title="500 Internal Server Error"
      imageSrc="/assets/images/error/500.png"
      imageAlt="500 서버 오류 폭발 캐릭터"
      description="서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
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

export default ServerErrorPage;
