import { useState, useMemo } from "react";

type Props = {
  src?: string;
  company?: string;
  size?: number; // px
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
          "rounded object-cover",
          className ?? "",
          `h-[${size}px] w-[${size}px]`,
        ].join(" ")}
        onError={() => setShowImg(false)} // 실패 시 폴백으로 전환
      />
    );
  }

  // 로컬 폴백(네트워크 사용 안 함)
  return (
    <div
      aria-hidden="true"
      className={[
        "grid place-items-center rounded bg-base-200 text-xs font-semibold",
        className ?? "",
        `h-[${size}px] w-[${size}px]`,
      ].join(" ")}
    >
      {label}
    </div>
  );
}
