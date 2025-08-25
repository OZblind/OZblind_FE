/** 숫자 2자리 패딩 */
const pad = (n: number) => String(n).padStart(2, "0");

/** YY.MM.DD (예: 25.08.01) */
export function formatYyMmDd(d: Date): string {
  return `${pad(d.getFullYear() % 100)}.${pad(d.getMonth() + 1)}.${pad(
    d.getDate()
  )}`;
}

/** YYYY.MM.DD HH:mm:ss (예: 2025.08.05 14:23:11) */
/** Date -> 문자열 */
export function formatYyyyMmDdHms(d: Date): string {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// YYYY-MM-DD → 로컬 타임존 기준 날짜 객체
/** 문자열 -> Date */
export function parseYMDToLocalDate(
  ymd: string,
  endOfDay = false
): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return endOfDay
    ? new Date(y, mo, d, 23, 59, 59, 999)
    : new Date(y, mo, d, 0, 0, 0, 0);
}
