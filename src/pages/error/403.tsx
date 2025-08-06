import React from "react";
import ErrorLayout from "../../components/ErrorLayout";

const ForbiddenPage: React.FC = () => {
  return (
    <ErrorLayout
      title="403 Forbidden"
      imageSrc="/assets/images/error/403.png"
      imageAlt="403 캐릭터들"
    >
      <a
        href="/"
        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md text-base font-medium transition-colors duration-300 inline-block tracking-wide"
      >
        GO TO HOME
      </a>
    </ErrorLayout>
  );
};

export default ForbiddenPage;
