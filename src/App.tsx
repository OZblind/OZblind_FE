import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForbiddenPage from "./pages/error/403";
import NotFoundPage from "./pages/error/404";
import ServerErrorPage from "./pages/error/500";

// 임시 홈페이지 컴포넌트
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">환영합니다!</h1>
        <p className="text-gray-600 mb-6">
          웹사이트가 정상적으로 작동하고 있습니다.
        </p>
        <div className="text-sm text-gray-500">
          에러페이지 테스트:
          <a href="/test-404" className="text-blue-500 hover:underline ml-1">
            404
          </a>
          ,
          <a href="/403" className="text-blue-500 hover:underline ml-1">
            403
          </a>
          ,
          <a href="/500" className="text-blue-500 hover:underline ml-1">
            500
          </a>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<HomePage />} />
        
        {/* 에러 페이지들 */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
