import clsx from "clsx";
import { ExternalLink, Calendar } from "lucide-react";

type Props = {
  url: string;
  title?: string; // ← 여기로 설문 제목을 넣어주세요
  endDate?: string; // YYYY-MM-DD (input[type="date"])
  className?: string;
};

// YYYY-MM-DD → 로컬 타임존 기준 날짜 객체 (자정 지정 가능)
function parseYMDToLocalDate(ymd: string, endOfDay = false): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return endOfDay
    ? new Date(y, mo, d, 23, 59, 59, 999) // ← 당일 23:59:59.999
    : new Date(y, mo, d, 0, 0, 0, 0);
}

// URL이 안전한지 확인하는 함수 (http/https만 허용)
function isSafeUrl(url: string): boolean {
  return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url);
}

export default function LinkPreviewCard({
  url,
  title = "제목 없음",
  endDate,
  className,
}: Props) {
  if (!url) return null;

  // 오늘 시각과 마감일(당일 자정 끝) 비교
  const now = new Date();
  const end = endDate ? parseYMDToLocalDate(endDate, true) : null;
  const isExpired = Boolean(end && now > end); // 당일까지는 유효

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

      {isSafeUrl(url) ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "underline break-all",
            isExpired ? "text-gray-400 pointer-events-none" : "text-blue-600"
          )}
        >
          {url}
        </a>
      ) : (
        <span className="text-red-500">유효하지 않은 링크입니다.</span>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          "underline break-all",
          isExpired ? "text-gray-400 pointer-events-none" : "text-blue-600"
        )}
      >
        {url}
      </a>

      {endDate && (
        <p className="mt-2 flex items-center gap-1 text-sm">
          <Calendar className="w-4 h-4" />
          {isExpired ? `만료됨 (${endDate})` : `마감일: ${endDate}`}
        </p>
      )}
    </div>
  );
}
