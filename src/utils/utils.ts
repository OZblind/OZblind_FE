export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const fmtNum = (n: number) =>
  new Intl.NumberFormat(undefined, {
    notation: n > 999 ? "compact" : "standard",
  }).format(n);

const pad = (n: number) => String(n).padStart(2, "0");

/** YY.MM.DD (예: 25.08.01) */
export function formatYyMmDd(d: Date): string {
  return `${pad(d.getFullYear() % 100)}.${pad(d.getMonth() + 1)}.${pad(
    d.getDate()
  )}`;
}

/** YYYY.MM.DD HH:mm:ss (예: 2025.08.05 14:23:11) */
export function formatYyyyMmDdHms(d: Date): string {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
