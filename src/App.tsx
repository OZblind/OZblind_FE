import React from "react";
import { Routes, Route } from "react-router-dom";
import ForbiddenPage from "./pages/error/403";
import NotFoundPage from "./pages/error/404";
import ServerErrorPage from "./pages/error/500";
import TestPostWritePage from "./pages/test/TestPostWritePage";
import TestHub from "./pages/test/TestHub";

const App: React.FC = () => {
  return (
    <Routes>
      {/* 메인에서 테스트 허브 보여주기 */}
      <Route path="/" element={<TestHub />} />

      {/* 테스트 페이지들 */}
      <Route path="/test/write" element={<TestPostWritePage />} />

      {/* 에러 페이지 */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
