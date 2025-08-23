// router/AppRouter.tsx - 마이페이지 라우트 추가 버전
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { PATHS } from "@constants/paths";

import LandingPage from "@pages/landing/LandingPage"; // /auth (로비)
import MainPage from "@pages/main/MainPage"; // /main
import Error403 from "@pages/error/403";
import Error404 from "@pages/error/404";
import Error500 from "@pages/error/500";

import TestHub from "@pages/test/TestHub"; // /
import TestPostWritePage from "@pages/test/TestPostWritePage"; // /test/write
import TestSettingPage from "@pages/test/TestSettingPage"; // /test/setting
import TestFreeBoardList from "@src/pages/test/BoardList/TestFreeBoardList"; // test/board/free-list

// 마이페이지 관련 import 추가
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

// 임시+테스트용: 오즈키 인증 페이지 관련 import
import { useState, useEffect, useCallback } from "react";
import {
  useGetCurrentUserQuery,
  useActivateWithKeyMutation,
} from "@hooks/useAuthQueries";
import { useToastStore } from "@store/toastStore";
import { resolvePostLoginPath } from "@utils/postLogin";
import TestTagPage from "@src/pages/test/TestTagPage";
import TestPostReadPage from "@src/pages/test/TestPostReadPage";
import TestMainPage from "@src/pages/test/TestMainPage";
import TestSurveyList from "@src/pages/test/BoardList/TestSurveyList";
import TestJobBannerPage from "@src/pages/test/TestJobBanner";

import { isValidOzKeyLocal, resolveCohortNumber } from "@src/utils/auth/ozKey";
import PostDetailPage from "@src/pages/boards/PostDetailPage";
import PostListPage from "@src/pages/boards/PostListPage";
import SurveyListPage from "@src/pages/boards/SurveyListPage";

import TestGithubList from "@src/pages/test/BoardList/TestGithubList";
import MainLayout from "@src/layouts/MainLayout";
import WritePostPage from "@src/components/Board/WritePostPage";

/** 공개(보호 불필요) 경로 목록 */
const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  PATHS.ROOT,
  PATHS.AUTH,
  PATHS.ERROR_403,
  PATHS.ERROR_404,
  PATHS.ERROR_500,
]);

/** 임시: 오즈키 인증 페이지 (담당자 구현 전) — 실동작 가능한 DEV 버전 */
function KeyVerifyPlaceholder() {
  const [plainKey, setPlainKey] = useState("");
  const { push } = useToastStore();
  const navigate = useNavigate();

  const activateMut = useActivateWithKeyMutation();
  const currentUserQuery = useGetCurrentUserQuery(false); // 인증 후 리프레시용

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idToken = sessionStorage.getItem("oz_pending_idt");
    if (!idToken) {
      push({
        message: "인증 토큰이 없습니다. 다시 로그인 해주세요.",
        type: "error",
      });
      navigate(PATHS.AUTH, { replace: true });
      return;
    }
    const key = plainKey.trim();
    if (!key) {
      push({ message: "오즈키를 입력해 주세요.", type: "warning" });
      return;
    }

    // ✅ 프론트 1차 검증(UX용): env의 키와 문자열 일치 확인
    if (!isValidOzKeyLocal(key)) {
      push({ message: "유효하지 않은 오즈키입니다.", type: "error" });
      return;
    }

    // 코호트 번호 결정: 키에서 COHORT## 추출 → env fallback
    let cohortNumber: number;
    try {
      cohortNumber = resolveCohortNumber(key);
    } catch {
      push({ message: "코호트 번호를 확인할 수 없습니다.", type: "error" });
      return;
    }

    try {
      await activateMut.mutateAsync({ idToken, cohortNumber, plainKey: key });

      // 성공 → 임시 저장된 id_token 제거
      sessionStorage.removeItem("oz_pending_idt");

      // 프로필 새로고침 후 이동
      await currentUserQuery.refetch();
      push({ message: "오즈키 인증 완료!", type: "success" });
      navigate(resolvePostLoginPath(true), { replace: true });
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? (err as { message?: string }).message ?? "인증 실패"
          : "인증 실패";
      push({ message: msg, type: "error" });
    }
  }

  const disabled = activateMut.isPending;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w_full max-w-md card bg-base-200 shadow-xl"
      >
        <div className="card-body">
          <h1 className="card-title">오즈키 인증</h1>
          <p className="text-sm opacity-80">
            오즈키를 입력해 인증을 완료하세요.
          </p>

          <input
            type="text"
            value={plainKey}
            onChange={(e) => setPlainKey(e.target.value)}
            placeholder="예: OZ-TEST-KEY-2025-COHORT11"
            className="input input-bordered w-full"
            disabled={disabled}
          />

          <div className="card-actions justify-end mt-2">
            <button
              type="submit"
              className={`btn btn-primary ${disabled ? "loading" : ""}`}
              disabled={disabled}
            >
              {disabled ? "인증 중..." : "인증하기"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

export default function AppRouter() {
  // 앱 최초 1회 JWT/프로필 확인
  const { loading } = useAuthBootstrap();

  // Zustand 셀렉터로 필요한 값만 구독 → 불필요 리렌더 줄이기
  const isAuthed = useAuthStore((s) => Boolean(s.tokens.accessToken));
  const isOzAuthenticated = useAuthStore((s) => s.isOzAuthenticated);

  const location = useLocation();
  const navigate = useNavigate();

  // pending 상태 신호: 세션에 임시 저장된 id_token
  const pendingIdt =
    typeof window !== "undefined"
      ? sessionStorage.getItem("oz_pending_idt")
      : null;

  // 같은 경로로 중복 이동 방지
  const goto = useCallback(
    (to: string) => {
      if (location.pathname !== to) navigate(to, { replace: true });
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    if (loading) return;

    // A) AUTH에 있는데 로그인되면 → KEY_VERIFY 또는 MAIN
    if (location.pathname === PATHS.AUTH && isAuthed) {
      const next = isOzAuthenticated
        ? resolvePostLoginPath(true)
        : PATHS.KEY_VERIFY;
      goto(next);
      return;
    }

    // B) 보호 라우트 진입 조건: 공개 or (KEY_VERIFY && pendingIdt)
    const isPublic =
      PUBLIC_PATHS.has(location.pathname) ||
      (location.pathname === PATHS.KEY_VERIFY && Boolean(pendingIdt));

    // B-1) 보호 라우트인데 로그인 없고, KEY_VERIFY도 아니면 → AUTH로
    if (!isAuthed && !isPublic) {
      const next = `${PATHS.AUTH}?next=${encodeURIComponent(
        location.pathname + location.search
      )}`;
      goto(next);
      return;
    }

    // C) KEY_VERIFY 중 인증 완료되면 → MAIN
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
    pendingIdt, // ✅ 의존성에 포함
    goto,
  ]);

  // 훅 호출 이후에 조기 return (로딩 스켈레톤)
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Routes>
      {/* 전역 레이아웃(ToastContainer 포함) */}
      <Route element={<RootLayout />}>
        {/* 테스트 라우트 */}
        <Route path={PATHS.ROOT} element={<TestHub />} />
        <Route path="/test/write" element={<TestPostWritePage />} />
        <Route path="/test/tag" element={<TestTagPage />} />
        <Route path="/test/post" element={<TestPostReadPage />} />
        <Route path="/test/setting" element={<TestSettingPage />} />
        <Route path="/test/main" element={<TestMainPage />}></Route>
        <Route path="/test/board/free-list" element={<TestFreeBoardList />} />
        <Route path="/test/board/survey-list" element={<TestSurveyList />} />
        <Route path="/test/board/github-list" element={<TestGithubList />} />
        <Route path="/test/jobbanner" element={<TestJobBannerPage />} />

        {/* API 테스트 라우트 */}
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/boards/free" element={<PostListPage board="free" />} />
        <Route path="/boards/jobs" element={<PostListPage board="jobs" />} />
        <Route path="/boards/info" element={<PostListPage board="info" />} />
        <Route path="/boards/survey" element={<SurveyListPage />} />
        <Route
          path="/boards/github"
          element={<PostListPage board="github" />}
        />

        {/* 인증 로비(공개) */}
        <Route path={PATHS.AUTH} element={<LandingPage />} />

        {/* 보호: /key-verify (JWT + 미인증) */}
        <Route
          path={PATHS.KEY_VERIFY}
          element={
            (isAuthed && isOzAuthenticated === false) || pendingIdt ? (
              <KeyVerifyPlaceholder />
            ) : isAuthed && isOzAuthenticated === true ? (
              <Navigate to={PATHS.MAIN} replace />
            ) : (
              redirectWithIntent(PATHS.AUTH, location)
            )
          }
        />

        {/* 메인 페이지 + 게시글 + 마이페이지 */}
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

          <Route path={PATHS.GITHUB_BOARD} element={<TestGithubList />} />
          <Route path={PATHS.POST_CREATE} element={<WritePostPage />} />
          <Route path={PATHS.POST_DETAIL} element={<PostDetailPage />} />

          {/* 보호: 마이페이지 (JWT + 인증 완료) */}
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
            {/* 마이페이지 중첩 라우팅 */}
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
