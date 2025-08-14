import { useState } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "@constants/paths";
import { useAuthStore } from "@store/authStore";
import { useLogoutMutation } from "@hooks/useAuthQueries";
import { useToastStore } from "@store/toastStore";
import { NotificationModal } from "@components/Notice";
// import InfiniteScrollSmokeTest from "./TestInfiniteScroll";

export default function TestHub() {
  const [noticeOpen, setNoticeOpen] = useState(false);

  const items = [
    { to: "/test/write", label: "게시글 작성 테스트" },
    { to: "/403", label: "403 테스트" },
    { to: "/500", label: "500 테스트" },
    { to: "/test/setting", label: "사용자 모달 테스트" },
    // 404는 없는 주소
    // --- 인증 관련 테스트 링크 ---
    { to: PATHS.AUTH, label: "로그인/회원가입(로비) 테스트" },
    { to: PATHS.MAIN, label: "보호 라우트: /main (JWT + 인증 완료)" },
    { to: PATHS.KEY_VERIFY, label: "보호 라우트: /key-verify (JWT + 미인증)" },
  ];

  const { user, tokens, isOzAuthenticated } = useAuthStore();
  const logoutMut = useLogoutMutation();
  const { push } = useToastStore();

  const onLogout = async () => {
    try {
      await logoutMut.mutateAsync();
      push({ message: "로그아웃 완료", type: "success" });
    } catch {
      push({
        message: "로그아웃 실패 — 클라이언트 상태 초기화",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Hub</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="rounded-xl border px-4 py-3 text-center hover:bg-gray-50 active:scale-[0.98] transition"
          >
            {it.label}
          </Link>
        ))}

        {/* 404 테스트용: 존재하지 않는 경로로 보내기 */}
        <Link
          to="/_not-exist_404_example"
          className="rounded-xl border px-4 py-3 text-center hover:bg-gray-50 active:scale-[0.98] transition"
        >
          404 테스트
        </Link>

        {/* 🔔 알림 모달 UI 테스트 (라우팅 없이 띄우기) */}
        <button
          type="button"
          onClick={() => setNoticeOpen(true)}
          className="rounded-xl border px-4 py-3 text-center hover:bg-gray-50 active:scale-[0.98] transition"
        >
          알림 모달 UI 테스트
        </button>
      </div>

      {/* 인증 상태 패널 */}
      <section className="rounded-xl border p-4">
        <h2 className="font-semibold mb-3">Auth 상태</h2>
        <ul className="text-sm space-y-1">
          <li>
            accessToken:{" "}
            <span className="font-mono">
              {tokens.accessToken ? "있음" : "없음"}
            </span>
          </li>
          <li>
            refreshToken:{" "}
            <span className="font-mono">
              {tokens.refreshToken ? "있음" : "없음"}
            </span>
          </li>
          <li>
            isOzAuthenticated:{" "}
            <span className="font-mono">{String(isOzAuthenticated)}</span>
          </li>
          <li>
            user.email: <span className="font-mono">{user?.email ?? "-"}</span>
          </li>
        </ul>

        {/* 버튼 영역 */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to={PATHS.AUTH}
            className="inline-flex items-center rounded-lg border px-3 py-2 hover:bg-gray-50 active:scale-[0.98] transition text-sm"
          >
            /auth 이동
          </Link>
          <Link
            to={PATHS.MAIN}
            className="inline-flex items-center rounded-lg border px-3 py-2 hover:bg-gray-50 active:scale-[0.98] transition text-sm"
          >
            /main 이동
          </Link>
          <Link
            to={PATHS.KEY_VERIFY}
            className="inline-flex items-center rounded-lg border px-3 py-2 hover:bg-gray-50 active:scale-[0.98] transition text-sm"
          >
            /key-verify 이동
          </Link>
          <button
            type="button"
            onClick={onLogout}
            disabled={logoutMut.isPending}
            className="inline-flex items-center rounded-lg border px-3 py-2 hover:bg-gray-50 active:scale-[0.98] transition text-sm disabled:opacity-60"
          >
            {logoutMut.isPending ? "로그아웃..." : "로그아웃"}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          보호 라우트 접근 시 비로그인/미인증이면 의도 경로를 저장한 뒤 /auth로
          이동합니다.
        </p>
      </section>

      {/* 🔔 알림 모달 (UI만) */}
      <NotificationModal
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
      />

      {/* 무한 스크롤 스모크 테스트 */}
      {/* <InfiniteScrollSmokeTest /> */}
    </div>
  );
}
