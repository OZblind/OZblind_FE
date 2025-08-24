import { Outlet } from "react-router-dom";
import ToastContainer from "@components/commons/Toast/ToastContainer";
import Toast from "@components/commons/Toast/Toast";
import { useToastStore } from "@store/toastStore";
import { useNewFlagEvery30s } from "@hooks/useNewFlagEvery30s";
import { tokenStore } from "@api/client";

/** 전역 레이아웃: 모든 페이지에 공통 UI(Toast 등) 적용 */
export default function RootLayout() {
  const { toasts } = useToastStore();

  if (tokenStore.access) {
    // 로그인 시에만
    useNewFlagEvery30s(); // 알림 전역 30초 폴링, 한 번만 마운트
  }

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
