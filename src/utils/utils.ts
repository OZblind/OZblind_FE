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
