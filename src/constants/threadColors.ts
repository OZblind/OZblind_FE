/** 스레드 색 팔레트: bg/stroke/fill 세트 (purge 방지용 상수) */
export const THREAD_COLOR_CLASSES = [
  { bg: "bg-blue-500", stroke: "stroke-blue-500", fill: "fill-blue-500" },
  {
    bg: "bg-emerald-500",
    stroke: "stroke-emerald-500",
    fill: "fill-emerald-500",
  },
  { bg: "bg-amber-500", stroke: "stroke-amber-500", fill: "fill-amber-500" },
  { bg: "bg-red-500", stroke: "stroke-red-500", fill: "fill-red-500" },
  { bg: "bg-violet-500", stroke: "stroke-violet-500", fill: "fill-violet-500" },
  { bg: "bg-teal-500", stroke: "stroke-teal-500", fill: "fill-teal-500" },
  { bg: "bg-pink-500", stroke: "stroke-pink-500", fill: "fill-pink-500" },
  { bg: "bg-cyan-500", stroke: "stroke-cyan-500", fill: "fill-cyan-500" },
  {
    bg: "bg-fuchsia-500",
    stroke: "stroke-fuchsia-500",
    fill: "fill-fuchsia-500",
  },
  { bg: "bg-orange-500", stroke: "stroke-orange-500", fill: "fill-orange-500" },
  { bg: "bg-green-500", stroke: "stroke-green-500", fill: "fill-green-500" },
  { bg: "bg-sky-500", stroke: "stroke-sky-500", fill: "fill-sky-500" },
] as const;

export type ThreadColor = (typeof THREAD_COLOR_CLASSES)[number];
