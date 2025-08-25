import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { initShadow, observeRootTheme } from "./theme/shadowTheme";

type Props = { html: string; className?: string };

export default function ShadowHtmlViewer({ html, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const teardownRef = useRef<() => void>(() => {});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // 섀도우 + 공통 CSS 주입
    const { shadow, refs } = initShadow(host);

    // HTML 내용 삽입 (토스트 클래스 부여로 동일 룩)
    const wrap = document.createElement("div");
    wrap.className = "toastui-editor-contents";
    wrap.innerHTML = DOMPurify.sanitize(html ?? "", {
      ADD_ATTR: ["target", "rel"],
    });
    shadow.append(wrap);

    // 테마 적용 + 옵저버 등록
    const unobserve = observeRootTheme(shadow, refs);
    teardownRef.current = () => {
      unobserve();
      while (host.firstChild) host.removeChild(host.firstChild);
    };

    return teardownRef.current;
  }, [html]);

  return <div ref={hostRef} className={className} style={{ width: "100%" }} />;
}
