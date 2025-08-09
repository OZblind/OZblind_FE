import { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

import "tui-color-picker/dist/tui-color-picker.css";
import "@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css";
import colorSyntax from "@toast-ui/editor-plugin-color-syntax";

type EditorOptions = ConstructorParameters<typeof Editor>[0];

interface ToastEditorProps {
  onChange?: (content: string) => void;
}

export default function ToastEditor({ onChange }: ToastEditorProps) {
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

  return (
    <div
      ref={editorContainerRef}
      className="toast-editor-wrapper"
      aria-label="TOAST UI Editor"
    />
  );
}
