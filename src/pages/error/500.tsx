import React from "react";
import ErrorLayout from "../../components/ErrorLayout";
import { ERROR_CONFIGS } from "../../config/errorConfigs";

const ServerErrorPage: React.FC = () => {
  const handleTryAgain = (): void => {
    window.location.reload();
  };

  const handleGoHome = (): void => {
    window.location.href = "/";
  };

  return (
    <ErrorLayout
      title={ERROR_CONFIGS[500].title}
      imageSrc={ERROR_CONFIGS[500].imageSrc}
      imageAlt={ERROR_CONFIGS[500].imageAlt}
      description={ERROR_CONFIGS[500].description}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 홈으로 이동 버튼 */}
        <button
          type="button"
          onClick={handleGoHome}
          className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-md text-base font-medium transition-colors duration-300 tracking-wide"
        >
          홈으로 이동
        </button>

        {/* 다시 시도 버튼 */}
        <button
          type="button"
          onClick={handleTryAgain}
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-md text-base font-medium transition-colors duration-300 tracking-wide"
        >
          다시 시도
        </button>
      </div>
    </ErrorLayout>
  );
};

export default ServerErrorPage;
