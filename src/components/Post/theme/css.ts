// 외부 CSS를 문자열로 가져와 Shadow DOM에 주입 (Vite: ?raw)
import viewerCSS from "@toast-ui/editor/dist/toastui-editor-viewer.css?raw";
import prismLightCSS from "prismjs/themes/prism.css?raw";
import prismDarkCSS from "prismjs/themes/prism-okaidia.css?raw";

export const VIEWER_CSS = viewerCSS;
export const PRISM_LIGHT = prismLightCSS;
export const PRISM_DARK = prismDarkCSS;

// 상속 차단용 기본 글자 크기/라인 높이
export const BASE_RESET = `:host{ font-size:16px; line-height:1.7; }`;

// 라이트/다크 오버라이드 (가독성 보정)
export const LIGHT_OVERRIDES = `
.toastui-editor-contents{ color:#111827; }
.toastui-editor-contents code{
  background:#f3f4f6; color:#111827;
  padding:0.1rem 0.25rem; border-radius:4px;
}
`;

export const DARK_OVERRIDES = `
/* 본문/일반 텍스트를 완전 흰색으로 */
.toastui-editor-contents{ color:#ffffff; }

/* 본문 요소들도 안전하게 화이트 고정 */
.toastui-editor-contents p,
.toastui-editor-contents li,
.toastui-editor-contents td,
.toastui-editor-contents th { color:#ffffff; }

/* 헤딩은 확실히 흰색 */
.toastui-editor-contents h1,
.toastui-editor-contents h2,
.toastui-editor-contents h3,
.toastui-editor-contents h4,
.toastui-editor-contents h5,
.toastui-editor-contents h6 { color:#ffffff; }

/* 링크는 살짝 색 유지(원하면 #fff로 바꿔도 됨) */
.toastui-editor-contents a{ color:#c7d2fe; }
.toastui-editor-contents a:hover{ color:#a5b4fc; }

/* 구분선/인용문 대비 (인용문도 흰색으로 보고 싶으면 color:#fff 로 바꿔도 OK) */
.toastui-editor-contents hr{ border-color:#334155; }
.toastui-editor-contents blockquote{
  color:#e2e8f0;               /* ← 더 하얗게 원하면 #ffffff */
  border-left-color:#475569;
  background:transparent;
}

/* 코드 블록/인라인: 어두운 배경 + 흰 글자 */
.toastui-editor-contents pre{ background:#0b1220; }
.toastui-editor-contents pre code{ color:#ffffff; }

.toastui-editor-contents code{
  background:#111827;
  color:#ffffff;
  padding:0.1rem 0.25rem;
  border-radius:4px;
}

/* 표 테두리 대비 */
.toastui-editor-contents table{ border-color:#475569; }
.toastui-editor-contents th,
.toastui-editor-contents td{ border-color:#475569; }
`;
