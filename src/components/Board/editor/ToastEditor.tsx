import { useLayoutEffect, useRef, useEffect } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

import "tui-color-picker/dist/tui-color-picker.css";
import "@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css";
import colorSyntax from "@toast-ui/editor-plugin-color-syntax";

type EditorOptions = ConstructorParameters<typeof Editor>[0];

interface ToastEditorProps {
  initial?: string;
  height?: string;
  onChange?: (content: string) => void;
}

export default function ToastEditor({
  initial = "",
  height = "600px",
  onChange,
}: ToastEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(onChange);
  const rafIdRef = useRef<number | null>(null);

  // 최신 onChange 유지(재생성 없이)
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // ※ useLayoutEffect로 마운트/정리 타이밍 확실히
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const options: EditorOptions = {
      el: containerRef.current,
      height,
      initialEditType: "wysiwyg",
      previewStyle: "vertical",
      initialValue: initial,
      plugins: [colorSyntax],
    };

    const inst = new Editor(options);
    editorRef.current = inst;

    const handleChange = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        const html = editorRef.current?.getHTML();
        if (html != null && onChangeRef.current) onChangeRef.current(html);
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
  }, [height, initial]);

  return (
    <div
      ref={containerRef}
      className="toast-editor-wrapper"
      aria-label="TOAST UI Editor"
    />
  );
}
