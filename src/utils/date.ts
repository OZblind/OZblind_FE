/**
 * 숫자 2자리 패딩
 */
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * YY.MM.DD 형식 (예: 25.08.01)
 */
export function formatYyMmDd(d: Date): string {
  return `${pad(d.getFullYear() % 100)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/**
 * YYYY.MM.DD HH:mm:ss 형식 (예: 2025.08.05 14:23:11)
 */
export function formatYyyyMmDdHms(d: Date): string {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
