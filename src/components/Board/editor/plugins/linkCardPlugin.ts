import type Editor from "@toast-ui/editor";

export type EditorWithLinkCard = Editor & {
  __insertLinkCard?: (url: string) => void;
};

export type LinkCardPluginOptions = {
  className?: string; // 카드에 부여할 클래스
  titleText?: string; // 카드 상단 제목
};

export default function linkCardPlugin(
  editor: EditorWithLinkCard,
  options?: LinkCardPluginOptions
) {
  const className = options?.className ?? "tui-link-card";
  const titleText = options?.titleText ?? "📄 설문지 미리보기";

  editor.__insertLinkCard = (url: string) => {
    if (!url) return;
    const safeUrl = escapeHtml(url);

    const cardHTML = `
      <div class="${className}" style="padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-weight:600;font-size:15px;">${titleText}</span>
        </div>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="word-break:break-all;text-decoration:underline;">
          ${safeUrl}
        </a>
      </div>
    `.trim();

    const current = editor.getHTML();
    editor.setHTML(cardHTML + current);
  };
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
