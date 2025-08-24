import { Outlet } from "react-router-dom";
import ToastContainer from "@components/commons/Toast/ToastContainer";
import Toast from "@components/commons/Toast/Toast";
import { useToastStore } from "@store/toastStore";
import { useAuthStore } from "@store/authStore";
import { useNewFlagEvery30s } from "@hooks/useNewFlagEvery30s";

/** 전역 레이아웃: 모든 페이지에 공통 UI(Toast 등) 적용 */
export default function RootLayout() {
  const { toasts } = useToastStore();
  const accessToken = useAuthStore((s) => s.tokens.accessToken);
  const isOzAuthenticated = useAuthStore((s) => s.isOzAuthenticated);

  const enabled = !!accessToken || !!isOzAuthenticated;
  useNewFlagEvery30s({ enabled });

  return (
    <>
      <Outlet />
      <ToastContainer>
        {toasts.map((t) => (
          <div key={t.id}>
            <Toast
              message={t.message}
              type={t.type}
              durationMs={t.durationMs}
            />
          </div>
        ))}
      </ToastContainer>
    </>
  );
}
