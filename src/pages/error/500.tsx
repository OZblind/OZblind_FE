import React from "react";

const ServerErrorPage: React.FC = () => {
  const handleTryAgain = (): void => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* 500 페이지용 큰 이미지 */}
      <div className="mb-12">
        <img
          src="/assets/images/error/500.png"
          alt="500 폭발 캐릭터"
          className="h-56 w-auto max-w-md" 
        />
      </div>

      {/* 에러 제목 */}
      <h1 className="text-6xl font-bold text-gray-800 mb-12 tracking-wide text-center">
        500 Internal Server Error
      </h1>

      {/* 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleTryAgain}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md text-base font-medium transition-colors duration-300 tracking-wide"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
};

export default ServerErrorPage;
