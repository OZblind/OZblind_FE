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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {imageSrc && (
        <div className="mb-12">
          <img
            src={imageSrc}
            alt={imageAlt || "Error Character"}
            className="h-40 w-auto max-w-sm"
          />
        </div>
      )}
      <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-12 tracking-wide text-center">
        {title}
      </h1>
      <div className="flex flex-col md:flex-row gap-4">{children}</div>
    </div>
  );
};

export default ErrorLayout;
