// 라우팅 + 부팅 훅 + 가드 분기

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

import { useAuthBootstrap } from "@hooks/useAuthBootstrap";
import { useAuthStore } from "@store/authStore";
import RootLayout from "@layouts/RootLayout";
import { redirectWithIntent } from "./guards";

// 임시+테스트용: 오즈키 인증 페이지 관련 import
import { useState, useEffect, useCallback } from "react";
import {
  useVerifyOzKeyMutation,
  useGetCurrentUserQuery,
} from "@hooks/useAuthQueries";
import { useToastStore } from "@store/toastStore";
import { resolvePostLoginPath } from "@utils/postLogin";
import TestMainPage from "@src/pages/test/TestMainPage";

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
  const [key, setKey] = useState("");
  const { push } = useToastStore();
  const navigate = useNavigate();

  const verifyMut = useVerifyOzKeyMutation();
  // 부팅 훅에서 쓰던 "현재 유저 조회"를 여기선 수동 refetch 용으로만 사용
  const currentUserQuery = useGetCurrentUserQuery(false); // enabled=false

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      push({ message: "키를 입력해 주세요.", type: "warning" });
      return;
    }

    try {
      const r = await verifyMut.mutateAsync(trimmed);
      if (r.ok) {
        // 서버가 authenticated=true로 업데이트했다고 가정 → 최신 상태 재조회
        await currentUserQuery.refetch();
        push({ message: "오즈키 인증 완료!", type: "success" });

        // 의도 경로 복구(있으면) 또는 /main
        const next = resolvePostLoginPath(true);
        navigate(next, { replace: true }); // SPA 전환 (풀리로드 X)
      } else {
        push({ message: "인증 실패. 다시 시도해 주세요.", type: "error" });
      }
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? ((err as { message?: string }).message ?? "인증 실패")
          : "인증 실패";
      push({ message: msg, type: "error" });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w_full max-w-md card bg-base-200 shadow-xl"
      >
        <div className="card-body">
          <h1 className="card-title">오즈키 인증</h1>
          <p className="text-sm opacity-80">
            테스트용 페이지입니다. 키를 입력해 인증을 진행하세요.
          </p>

          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="666 (mock key)"
            className="input input-bordered w-full"
            disabled={verifyMut.isPending}
          />

          <div className="card-actions justify-end mt-2">
            <button
              type="submit"
              className={`btn btn-primary ${
                verifyMut.isPending ? "loading" : ""
              }`}
              disabled={verifyMut.isPending}
            >
              {verifyMut.isPending ? "인증 중..." : "인증하기"}
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

    // B) 보호 라우트(= 공개 목록에 없는 경로)에 있는데 로그아웃되면 → AUTH (의도 경로 유지)
    const isPublic = PUBLIC_PATHS.has(location.pathname);
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
    goto, // ← 의존성에 포함
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
        <Route path="/test/setting" element={<TestSettingPage />} />
        <Route path="/test/main" element={<TestMainPage />}></Route>
        <Route path="/test/board/free-list" element={<TestFreeBoardList />} />

        {/* 인증 로비(공개) */}
        <Route path={PATHS.AUTH} element={<LandingPage />} />

        {/* 보호: /main (JWT + 인증 완료) */}
        <Route
          path={PATHS.MAIN}
          element={
            isAuthed && isOzAuthenticated === true ? (
              <MainPage />
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
