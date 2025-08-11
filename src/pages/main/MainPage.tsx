import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@hooks/useAuthQueries";
import { PATHS } from "@constants/paths";
import { useToastStore } from "@store/toastStore";

export default function MainPage() {
  const navigate = useNavigate();
  const { push } = useToastStore();
  const logoutMut = useLogoutMutation();

  const onClickLogout = async () => {
    try {
      await logoutMut.mutateAsync();
      push({ message: "로그아웃 되었습니다.", type: "success" });
    } catch {
      push({
        message: "로그아웃 실패 — 토큰 상태를 초기화합니다.",
        type: "error",
      });
    } finally {
      navigate(PATHS.ROOT, { replace: true });
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Main Page</h1>
      <button
        type="button"
        onClick={onClickLogout}
        disabled={logoutMut.isPending}
      >
        {logoutMut.isPending ? "Logging out..." : "Logout"}
      </button>
    </main>
  );
}
