import { useEffect, useRef } from "react";
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import Prism from "prismjs";
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight";

// Prism 언어 지원 (필요한 것만)
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";

import { initShadow, observeRootTheme } from "./theme/shadowTheme";

type Props = { markdown: string; className?: string };

export default function ShadowToastViewer({ markdown, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const teardownRef = useRef<() => void>(() => {});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // 섀도우 + 공통 CSS 주입
    const { shadow, refs } = initShadow(host);

    // 뷰어 마운트
    const mountEl = document.createElement("div");
    shadow.append(mountEl);
    viewerRef.current = new Viewer({
      el: mountEl,
      initialValue: markdown ?? "",
      usageStatistics: false,
      plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
    });

    // 테마 적용 + 옵저버 등록
    const unobserve = observeRootTheme(shadow, refs);
    teardownRef.current = () => {
      unobserve();
      viewerRef.current?.destroy();
      viewerRef.current = null;
      while (host.firstChild) host.removeChild(host.firstChild);
    };

    return teardownRef.current;
  }, []);

  useEffect(() => {
    viewerRef.current?.setMarkdown(markdown ?? "");
  }, [markdown]);

  return <div ref={hostRef} className={className} style={{ width: "100%" }} />;
}
