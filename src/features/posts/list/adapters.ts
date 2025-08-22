import type { PostListItem } from "@api/posts";
import type { FreeBoardItem } from "@src/components/Board/free";
import type {
  SurveyCardProps,
  SurveyStatus,
} from "@src/components/Board/survey";
import type { Tag, TagCategory } from "@src/types/tag";

export function toYYMMDD(dateStr: string) {
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}
export type SurveyExtra = { end_date?: string; link?: string };

function guessCategory(label: string): Tag["category"] {
  return /\d+\s*기$/.test(label.trim()) ? "cohort" : "position";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTag(input: any): Tag {
  const id = input?.id as TagCategory;
  const label = String(input?.label ?? input?.name ?? "");
  const category = (input?.category ?? guessCategory(label)) as TagCategory;
  // Tag.id 타입에 맞춰 선택 (숫자만 허용이면 i 사용)

  return {
    id, // ✅ 필수
    label, // ✅ 필수
    category, // ✅ 필수
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTagsFromApi(raw: any, limit = 2): Tag[] {
  if (!raw) return [];
  const arr = Array.isArray(raw?.results) ? raw.results : raw;
  if (!Array.isArray(arr)) return [];

  // 문자열 배열인 경우
  if (arr.length && typeof arr[0] === "string") {
    return arr.slice(0, limit).map((label: string, i) =>
      normalizeTag({
        label,
        category: guessCategory(label),
        id: i,
      })
    );
  }

  // 객체 배열인 경우
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, limit).map((t: any) => normalizeTag(t));
}

export function mapToFreeItem(p: PostListItem): FreeBoardItem {
  return {
    id: p.id,
    no: p.id, // 필요 시 서버 No 필드로 교체
    title: p.title,
    author: typeof p.user === "string" ? p.user : "익명",
    dateText: toYYMMDD(p.created_at),
    views: p.view_count ?? 0,
    likes: p.like_count ?? 0,
  };
}

function computeStatus(endISO?: string): SurveyStatus {
  if (!endISO) return "active";
  const end = new Date(endISO).getTime();
  return Number.isFinite(end) && end < Date.now() ? "expired" : "active";
}

// 목록 아이템 + (선택)추가정보 → 카드 프롭스로
export function mapToSurveyCard(
  item: PostListItem,
  extra?: SurveyExtra
): SurveyCardProps {
  return {
    id: String(item.id),
    title: item.title,
    desc: undefined, // 목록에 요약 없으면 생략
    link: extra?.link, // 설문 링크
    deadline: extra?.end_date ?? "", // ISO 문자열
    status: computeStatus(extra?.end_date), // active/expired
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tags: mapTagsFromApi((item as any).tags), // 서버가 tags 제공하면 변환, 없으면 []
  };
}
