import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "https://www.ozboard.shop/",
  //       changeOrigin: true,
  //       secure: false,
  //       // ★ 백엔드가 프로젝트 urls.py에서 path('api/', ...)로 걸려있다면 rewrite 필요 없음
  //       // rewrite: (path) => path.replace(/^\/api/, ""),  // ← 백엔드가 /api prefix가 "없을 때만" 켜세요
  //     },
  //   },
  // },
});
