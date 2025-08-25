import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { PATHS } from "@constants/paths";

import LandingPage from "@pages/landing/LandingPage";
import MainPage from "@pages/main/MainPage";
import Error403 from "@pages/error/403";
import Error404 from "@pages/error/404";
import Error500 from "@pages/error/500";

import MyPageLayout from "@pages/mypage/MyPageLayout";
import MyPageMain from "@pages/mypage/MyPageMain";
import MyPosts from "@pages/mypage/MyPosts";
import MyComments from "@pages/mypage/MyComments";
import MyBookmarks from "@pages/mypage/MyBookmarks";
import SearchPage from "@src/pages/boards/SearchPage";

import { useAuthBootstrap } from "@hooks/useAuthBootstrap";
import { useAuthStore } from "@store/authStore";
import RootLayout from "@layouts/RootLayout";
import { redirectWithIntent } from "./guards";

import { useEffect, useCallback, useState } from "react";
import PostDetailPage from "@pages/boards/PostDetailPage";
import PostListPage from "@pages/boards/PostListPage";
import SurveyListPage from "@pages/boards/SurveyListPage";
import MainLayout from "@layouts/MainLayout";
import WritePostPage from "@components/Board/WritePostPage";
import GithubListPage from "@pages/boards/GithubListPage";
import PostEditPage from "@src/pages/boards/PostEditPage";
import { SettingsPage } from "@components/SettingModal/SettingsPage";

/** 공개(보호 불필요) 경로 목록 */
const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  PATHS.AUTH,
  PATHS.ERROR_403,
  PATHS.ERROR_404,
  PATHS.ERROR_500,
]);

/** /key-verify 에서 띄울 SettingsPage 래퍼 (열림 상태/테마 상태 보관) */
function KeyVerifySettingsPage() {
  const [open, setOpen] = useState(true);
  const [theme, setTheme] = useState<"oz_dark" | "oz_light">(
    (document?.documentElement?.getAttribute("data-theme") as
      | "oz_dark"
      | "oz_light") ?? "oz_light"
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <SettingsPage
        isOpen={open}
        setIsOpen={setOpen}
        theme={theme}
        setTheme={setTheme}
      />
    </main>
  );
}

export default function AppRouter() {
  const { loading } = useAuthBootstrap();

  const isAuthed = useAuthStore((s) => Boolean(s.tokens.accessToken));
  const isOzAuthenticated = useAuthStore((s) => s.isOzAuthenticated);

  const location = useLocation();
  const navigate = useNavigate();

  const pendingIdt =
    typeof window !== "undefined"
      ? sessionStorage.getItem("oz_pending_idt")
      : null;

  const goto = useCallback(
    (to: string) => {
      if (location.pathname !== to) navigate(to, { replace: true });
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    if (loading) return;

    // A) /auth 에 있는데 로그인되면 → KEY_VERIFY 또는 MAIN
    if (location.pathname === PATHS.AUTH && isAuthed) {
      const next = isOzAuthenticated ? PATHS.MAIN : PATHS.KEY_VERIFY;
      goto(next);
      return;
    }

    // B) 보호 라우트 진입 조건: 공개 or (KEY_VERIFY && pendingIdt)
    const isPublic =
      PUBLIC_PATHS.has(location.pathname) ||
      (location.pathname === PATHS.KEY_VERIFY && Boolean(pendingIdt));

    if (!isAuthed && !isPublic) {
      const next = `${PATHS.AUTH}?next=${encodeURIComponent(
        location.pathname + location.search
      )}`;
      goto(next);
      return;
    }

    // C) /key-verify 에서 인증이 끝났다면 → /main
    if (
      location.pathname === PATHS.KEY_VERIFY &&
      isAuthed &&
      isOzAuthenticated
    ) {
      goto(PATHS.MAIN);
    }
  }, [
    loading,
    isAuthed,
    isOzAuthenticated,
    location.pathname,
    location.search,
    pendingIdt,
    goto,
  ]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* 루트 접근 시 상태 기반으로 분기 */}
        <Route
          path={PATHS.ROOT}
          element={
            isAuthed ? (
              isOzAuthenticated ? (
                <Navigate to={PATHS.MAIN} replace />
              ) : (
                <Navigate to={PATHS.KEY_VERIFY} replace />
              )
            ) : (
              <Navigate to={PATHS.AUTH} replace />
            )
          }
        />

        {/* 공개: /auth */}
        <Route path={PATHS.AUTH} element={<LandingPage />} />

        {/* 보호: /key-verify → SettingsPage로 교체 */}
        <Route
          path={PATHS.KEY_VERIFY}
          element={
            (isAuthed && isOzAuthenticated === false) || pendingIdt ? (
              <KeyVerifySettingsPage />
            ) : isAuthed && isOzAuthenticated === true ? (
              <Navigate to={PATHS.MAIN} replace />
            ) : (
              redirectWithIntent(PATHS.AUTH, location)
            )
          }
        />

        {/* 메인 + 게시판 + 마이페이지 */}
        <Route element={<MainLayout />}>
          <Route path={PATHS.MAIN} element={<MainPage />} />
          <Route
            path={PATHS.FREE_BOARD}
            element={<PostListPage board="free" />}
          />
          <Route
            path={PATHS.JOBS_BOARD}
            element={<PostListPage board="jobs" />}
          />
          <Route
            path={PATHS.INFO_BOARD}
            element={<PostListPage board="info" />}
          />
          <Route path={PATHS.SURVEY_BOARD} element={<SurveyListPage />} />
          <Route path={PATHS.GITHUB_BOARD} element={<GithubListPage />} />
          <Route path={PATHS.POST_DETAIL} element={<PostDetailPage />} />
          <Route path={PATHS.POST_CREATE} element={<WritePostPage />} />
          <Route path={PATHS.POST_EDIT} element={<PostEditPage />} />
          
          {/* 보호: 마이페이지 */}
          <Route
            path={PATHS.MYPAGE}
            element={
              isAuthed && isOzAuthenticated === true ? (
                <MyPageLayout />
              ) : isAuthed && isOzAuthenticated === false ? (
                <Navigate to={PATHS.KEY_VERIFY} replace />
              ) : (
                redirectWithIntent(PATHS.AUTH, location)
              )
            }
          >
            <Route index element={<MyPageMain />} />
            <Route path={PATHS.MYPAGE_POSTS} element={<MyPosts />} />
            <Route path={PATHS.MYPAGE_COMMENTS} element={<MyComments />} />
            <Route path={PATHS.MYPAGE_BOOKMARKS} element={<MyBookmarks />} />
          </Route>
        </Route>

        {/* 에러 */}
        <Route path={PATHS.ERROR_403} element={<Error403 />} />
        <Route path={PATHS.ERROR_500} element={<Error500 />} />
        <Route path="/boards/search" element={<SearchPage />} />

        {/* 404 */}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
}
