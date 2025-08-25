import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: [
      "@toast-ui/editor",
      "@toast-ui/editor/dist/toastui-editor-viewer",
      "@toast-ui/editor-plugin-code-syntax-highlight",
      "prismjs",
      "dompurify",
    ],
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       // target: "https://www.ozboard.shop/",
  //       target: "http://localhost:8000/", // 로컬 도커 테스트용
  //       changeOrigin: true,
  //       secure: false,
  //       // ★ 백엔드가 프로젝트 urls.py에서 path('api/', ...)로 걸려있다면 rewrite 필요 없음
  //       // rewrite: (path) => path.replace(/^\/api/, ""),  // ← 백엔드가 /api prefix가 "없을 때만" 켜세요
  //     },
  //   },
  // },
});
