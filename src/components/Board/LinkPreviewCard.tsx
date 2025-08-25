import { parseYMDToLocalDate } from "@src/utils/date";
import clsx from "clsx";
import { ExternalLink, Calendar } from "lucide-react";

type Props = {
  url: string;
  title?: string; // 설문 제목
  endDate?: string; // YYYY-MM-DD
  className?: string;
};

// http/https만 허용해 간단히 검증
function isSafeUrl(u: string): boolean {
  const s = u.trim();
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(s);
}

// 화면 표시용: 프로토콜 제거
function toDisplayText(u: string) {
  return u.replace(/^https?:\/\//i, "");
}

export default function LinkPreviewCard({
  url,
  title = "제목 없음",
  endDate,
  className,
}: Props) {
  const rawUrl = (url ?? "").trim();
  if (!rawUrl) return null;

  const now = new Date();
  const end = endDate ? parseYMDToLocalDate(endDate, true) : null;
  const isExpired = Boolean(end && now > end);

  const safe = isSafeUrl(rawUrl);
  const displayText = toDisplayText(rawUrl);

  return (
    <div
      className={clsx(
        "p-4 border rounded shadow-sm mt-1 transition-all",
        isExpired
          ? "bg-gray-100 text-gray-400 opacity-70 grayscale"
          : "bg-white text-black",
        className
      )}
    >
      <p className="font-semibold text-lg mb-1 flex items-center gap-2">
        {title}
        <ExternalLink className="w-4 h-4 opacity-70" aria-hidden />
      </p>

      {safe ? (
        <a
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={isExpired}
          className={clsx(
            "underline break-all",
            isExpired ? "text-gray-400 pointer-events-none" : "text-blue-600"
          )}
        >
          {displayText}
        </a>
      ) : (
        <span className="text-red-500">유효하지 않은 링크입니다.</span>
      )}

      {endDate && (
        <p className="mt-2 flex items-center gap-1 text-sm">
          <Calendar className="w-4 h-4" />
          {isExpired ? `만료됨 (${endDate})` : `마감일: ${endDate}`}
        </p>
      )}
    </div>
  );
}
