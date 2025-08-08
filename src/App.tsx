import React from "react";
import { Routes, Route } from "react-router-dom";
import ForbiddenPage from "./pages/error/403";
import NotFoundPage from "./pages/error/404";
import ServerErrorPage from "./pages/error/500";
import MyPageLayout from "./pages/mypage/MyPageLayout";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/mypage" element={<MyPageLayout />}></Route>
      {/* 에러 페이지 */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
