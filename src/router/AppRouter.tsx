// 라우팅 + 부팅 훅 + 가드 분기

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PATHS } from "@constants/paths";

import LandingPage from "@pages/landing/LandingPage"; // /auth (로비)
import MainPage from "@pages/main/MainPage"; // /main
import Error403 from "@pages/error/403";
import Error404 from "@pages/error/404";
import Error500 from "@pages/error/500";

import TestHub from "@pages/test/TestHub"; // /
import TestPostWritePage from "@pages/test/TestPostWritePage"; // /test/write

import { useAuthBootstrap } from "@hooks/useAuthBootstrap";
import { useAuthStore } from "@store/authStore";
import RootLayout from "@layouts/RootLayout";
import { redirectWithIntent } from "./guards";

// 임시: 오즈키 인증 페이지 (담당자 구현 전)
function KeyVerifyPlaceholder() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Key Verify</h1>
      <p>오즈키 인증 페이지는 별도 담당자가 구현 예정입니다.</p>
    </main>
  );
}

export default function AppRouter() {
  // 앱 최초 1회 JWT/프로필 확인
  const { loading } = useAuthBootstrap();
  const { tokens, isOzAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  const isAuthed = Boolean(tokens.accessToken);
  const isInactive = isAuthed && user?.isActive === false;

  return (
    <Routes>
      {/* 전역 레이아웃(ToastContainer 포함) */}
      <Route element={<RootLayout />}>
        {/* 테스트 라우트 */}
        <Route path={PATHS.ROOT} element={<TestHub />} />
        <Route path="/test/write" element={<TestPostWritePage />} />

        {/* 인증 로비(공개) */}
        <Route path={PATHS.AUTH} element={<LandingPage />} />

        {/* 보호: /main (JWT + 인증 완료) */}
        <Route
          path={PATHS.MAIN}
          element={
            isAuthed && isOzAuthenticated === true ? (
              isInactive ? (
                <Error403 />
              ) : (
                <MainPage />
              )
            ) : isAuthed && isOzAuthenticated === false ? (
              <Navigate to={PATHS.KEY_VERIFY} replace />
            ) : (
              redirectWithIntent(PATHS.AUTH, location)
            )
          }
        />

        {/* 보호: /key-verify (JWT + 미인증) */}
        <Route
          path={PATHS.KEY_VERIFY}
          element={
            isAuthed ? (
              isOzAuthenticated === false ? (
                <KeyVerifyPlaceholder />
              ) : (
                <Navigate to={PATHS.MAIN} replace />
              )
            ) : (
              redirectWithIntent(PATHS.AUTH, location)
            )
          }
        />

        {/* 에러 */}
        <Route path={PATHS.ERROR_403} element={<Error403 />} />
        <Route path={PATHS.ERROR_500} element={<Error500 />} />

        {/* 404 */}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
}
