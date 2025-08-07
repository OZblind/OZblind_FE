import React from "react";
import ErrorLayout from "../../components/ErrorLayout";

const NotFoundPage: React.FC = () => {
  const handleTryAgain = (): void => {
    window.location.reload();
  };

  const handleGoHome = (): void => {
    window.location.href = "/";
  };

  return (
    <ErrorLayout
      title="404 Not Found"
      imageSrc="/assets/images/error/404.png"
      imageAlt="404 페이지를 찾을 수 없음 캐릭터들"
      description="요청하신 페이지를 찾을 수 없습니다."
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 홈으로 이동 - 고스트 버튼 (왼쪽) */}
        <button
          type="button"
          onClick={handleGoHome}
          className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-md text-base font-medium transition-colors duration-300 tracking-wide"
        >
          홈으로 이동
        </button>

        {/* 다시 시도 - 메인 버튼 (오른쪽) */}
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

export default NotFoundPage;
