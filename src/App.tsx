import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ForbiddenPage from "./pages/error/403";
import NotFoundPage from "./pages/error/404";
import ServerErrorPage from "./pages/error/500";
import MyPageLayout from "./pages/mypage/MyPageLayout";
import MyPageMain from "./pages/mypage/MyPageMain";
import MyPosts from "./pages/mypage/MyPosts";
import MyComments from "./pages/mypage/MyComments";
import MyBookmarks from "./pages/mypage/MyBookmarks";

const App: React.FC = () => {
  return (
    <Routes>
      {/* 루트를 마이페이지로 리다이렉트 */}
      <Route path="/" element={<Navigate to="/mypage" replace />} />

      {/* 마이페이지 중첩 라우팅 */}
      <Route path="/mypage" element={<MyPageLayout />}>
        {/* 마이페이지 메인 - /mypage */}
        <Route index element={<MyPageMain />} />

        {/* 작성글 목록 - /mypage/posts */}
        <Route path="posts" element={<MyPosts />} />

        {/* 향후 추가될 상세 페이지들 */}
        <Route path="comments" element={<MyComments />} />
        <Route path="bookmarks" element={<MyBookmarks />} />
      </Route>

      {/* 에러 페이지 */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
