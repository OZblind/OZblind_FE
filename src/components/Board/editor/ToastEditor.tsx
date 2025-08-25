/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLayoutEffect, useRef, useEffect, useMemo, useState } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import "tui-color-picker/dist/tui-color-picker.css";
import "@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css";
import colorSyntax from "@toast-ui/editor-plugin-color-syntax";

type EditorOptions = ConstructorParameters<typeof Editor>[0];

interface ToastEditorProps {
  initial?: string;
  height?: string;
  onChange?: (content: string) => void;
  theme?: "light" | "dark";
}

export default function ToastEditor({
  initial = "",
  height = "600px",
  onChange,
  theme,
}: ToastEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(onChange);
  const rafIdRef = useRef<number | null>(null);

  // 테마 전환시 내용 보존
  const currentHTMLRef = useRef<string>(initial);

  // 최신 onChange 유지(재생성 없이)
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (initial != null) {
      currentHTMLRef.current = initial;
    }
  }, [initial]);

  const [themeFromAttr, setThemeFromAttr] = useState<"dark" | "default">(() => {
    const v = document.documentElement.getAttribute("data-theme");
    return v === "oz_dark" ? "dark" : "default";
  });
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          const v = el.getAttribute("data-theme");
          setThemeFromAttr(v === "oz_dark" ? "dark" : "default");
        }
      }
    });
    obs.observe(el, { attributes: true });
    return () => obs.disconnect();
  }, []);

  // 최종 테마 결정: prop 우선, 없으면 data-theme 기반
  const themeName = useMemo<"dark" | "default">(() => {
    if (theme) return theme === "dark" ? "dark" : "default";
    return themeFromAttr;
  }, [theme, themeFromAttr]);

  // ※ useLayoutEffect로 마운트/정리 타이밍 확실히
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const options: EditorOptions = {
      el: containerRef.current,
      height,
      initialEditType: "wysiwyg",
      previewStyle: "vertical",
      initialValue: currentHTMLRef.current ?? initial,
      plugins: [colorSyntax],
      ...(themeName === "dark" ? { theme: "dark" as any } : {}),
    };

    const inst = new Editor(options);
    editorRef.current = inst;

    const handleChange = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        const html = editorRef.current?.getHTML() ?? "";
        currentHTMLRef.current = html; // 항상 최신 내용 보관
        if (onChangeRef.current) onChangeRef.current(html);
      });
    };

    inst.on("change", handleChange);

    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      try {
        inst.off("change", handleChange);
      } catch {
        /* empty */
      }
      try {
        inst.destroy();
      } catch {
        /* empty */
      }
      editorRef.current = null;
    };
  }, [height, initial, themeName]);

  return (
    <div
      ref={containerRef}
      className="toast-editor-wrapper"
      aria-label="TOAST UI Editor"
    />
  );
}
