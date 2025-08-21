import { useState, useMemo } from "react";

type Props = {
  src?: string;
  company?: string;
  size?: number;
  className?: string;
};

function initials(text?: string): string {
  if (!text) return "JOB";
  const parts = text.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  const cand = (a + b).toUpperCase();
  return cand || "JOB";
}

export default function CompanyLogo({
  src,
  company,
  size = 36,
  className,
}: Props) {
  const [showImg, setShowImg] = useState<boolean>(Boolean(src));
  const label = useMemo(() => initials(company), [company]);

  if (showImg && src) {
    return (
      <img
        src={src}
        alt={company ?? "company logo"}
        width={size}
        height={size}
        decoding="async"
        referrerPolicy="no-referrer"
        className={[
          "rounded object-cover bg-gray-100",
          className ?? "",
          `h-[${size}px] w-[${size}px]`,
        ].join(" ")}
        onError={() => setShowImg(false)}
      />
    );
  }

  // 기존과 동일한 폴백 디자인
  return (
    <div
      aria-hidden="true"
      className={[
        "grid place-items-center rounded bg-gray-100 text-xs font-semibold text-gray-600",
        className ?? "",
        `h-[${size}px] w-[${size}px]`,
      ].join(" ")}
    >
      {label}
    </div>
  );
}
