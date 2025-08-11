import { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

import "tui-color-picker/dist/tui-color-picker.css";
import "@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css";
import colorSyntax from "@toast-ui/editor-plugin-color-syntax";
import {
  attachLinkCard,
  type EditorWithLinkCard,
} from "./plugins/linkCardPlugin";
type EditorOptions = ConstructorParameters<typeof Editor>[0];

interface ToastEditorProps {
  onChange?: (content: string) => void;
  formLink?: string; // 설문 링크 (변경 시 카드 삽입)
}

export default function ToastEditor({ onChange, formLink }: ToastEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (editorContainerRef.current) {
      const options: EditorOptions = {
        el: editorContainerRef.current,
        height: "600px",
        initialEditType: "wysiwyg",
        previewStyle: "vertical",
        plugins: [colorSyntax],
        hooks: {
          change() {
            const content = editorInstanceRef.current?.getHTML();
            if (onChange && content !== undefined) {
              onChange(content);
            }
          },
        },
      };

      editorInstanceRef.current = new Editor(options);
    }

    return () => {
      editorInstanceRef.current?.destroy();
      editorInstanceRef.current = null;
    };
  }, [onChange]);

  // formlink 변경 시 마다 플러그인 메서드 호출 -> 카드 삽입
  useEffect(() => {
    if (!formLink) return;
    const inst = editorInstanceRef.current as EditorWithLinkCard | null;
    attachLinkCard(inst as EditorWithLinkCard, {
      className: "survey-link-card",
      titleText: "📄 설문지 미리보기",
    });

    if (inst?.__insertLinkCard) {
      inst.__insertLinkCard(formLink);
    } else console.warn("__insertLinkCard 메서드가 없습니다");
  }, [formLink]);

  return (
    <div
      ref={editorContainerRef}
      className="toast-editor-wrapper"
      aria-label="TOAST UI Editor"
    />
  );
}
