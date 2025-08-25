import ShadowHtmlViewer from "./ShadowHtmlViewer";
import ShadowToastViewer from "./ShadowToastViewer";

type Props = {
  content: string | null | undefined;
  format?: "html" | "markdown"; // 명시 없으면 자동 추정
  className?: string; // 레이아웃용(섀도우 내부엔 영향 X)
};

function isLikelyHtml(s: string) {
  const str = (s ?? "").trim();
  if (!str) return false;
  if (str.startsWith("<")) return true;
  if (str.includes("</")) return true;
  return false;
}

export default function PostContent({ content, format, className }: Props) {
  const text = content ?? "";
  const resolved: "html" | "markdown" =
    format ?? (isLikelyHtml(text) ? "html" : "markdown");

  if (resolved === "html") {
    return <ShadowHtmlViewer html={text} className={className} />;
  }
  return <ShadowToastViewer markdown={text} className={className} />;
}
