import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bootstrapAuthSync } from "@utils/auth/sync";
import { queryKeys } from "@constants/queryKeys";

export const queryClient = new QueryClient();

// 멀티탭 동기화 부팅: LOGOUT 수신 시 currentUser 캐시 삭제
bootstrapAuthSync({
  onLogout: () => {
    queryClient.removeQueries({ queryKey: queryKeys.currentUser });
  },
  // 토큰 업데이트 시 탭에서도 프로필 최신화
  onTokenUpdate: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
);
