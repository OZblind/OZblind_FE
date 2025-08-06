import React from "react";
import ErrorLayout from "../../components/ErrorLayout";

const NotFoundPage: React.FC = () => {
  return (
    <ErrorLayout
      title="404 not found"
      imageSrc="/assets/images/error/404.png"
      imageAlt="404 캐릭터들"
    >
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md text-base font-medium transition-colors duration-300 tracking-wide"
      >
        Refresh Page
      </button>
    </ErrorLayout>
  );
};

export default NotFoundPage;
