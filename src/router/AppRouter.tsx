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

// 임시+테스트용: 오즈키 인증 페이지 관련 import
import { useState } from "react";
import {
  useVerifyOzKeyMutation,
  useGetCurrentUserQuery,
} from "@hooks/useAuthQueries";
import { useToastStore } from "@store/toastStore";
import { resolvePostLoginPath } from "@utils/postLogin";
import { useNavigate } from "react-router-dom";

// 임시: 오즈키 인증 페이지 (담당자 구현 전) — 실동작 가능한 DEV 버전
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
        className="w-full max-w-md card bg-base-200 shadow-xl"
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
              className={`btn btn-primary ${verifyMut.isPending ? "loading" : ""}`}
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
  const { tokens, isOzAuthenticated } = useAuthStore();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  const isAuthed = Boolean(tokens.accessToken);

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
                // 이곳을 키 인증 페이지로 바꿔주세요!
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
