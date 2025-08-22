import type { PostListItem } from "@api/posts";
import type { FreeBoardItem } from "@src/components/Board/free";
import type {
  SurveyCardProps,
  SurveyStatus,
} from "@src/components/Board/survey";
import type { Tag, TagCategory } from "@src/types/tag";
import { profileToTagsMock } from "@src/mocks/tags.mock"; // TODO[API-TAGS]: 서버 태그 확정되면 제거

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

/** NOTE: 서버 태그 포맷이 확정되기 전까지 안전 변환 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTag(input: any): Tag {
  const label = String(input?.label ?? input?.name ?? "");
  const category = (input?.category ?? guessCategory(label)) as TagCategory;

  // TODO[API-TAGS-ID]: Tag["id"] 최종 스키마(문자/숫자) 확정 시 여기 통일
  const rawId = input?.id ?? label;
  const id = String(rawId);

  return { id, label, category };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTagsFromApi(raw: any, limit = 2): Tag[] {
  if (!raw) return [];
  const arr = Array.isArray(raw?.results) ? raw.results : raw;
  if (!Array.isArray(arr)) return [];

  if (arr.length && typeof arr[0] === "string") {
    return arr
      .slice(0, limit)
      .map((label: string, i) =>
        normalizeTag({ label, category: guessCategory(label), id: i })
      );
  }
  // 객체 배열
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, limit).map((t: any) => normalizeTag(t));
}

export function mapToFreeItem(p: PostListItem): FreeBoardItem {
  return {
    id: p.id,
    no: p.id, // TODO[API-NO]: 서버가 별도 글번호 제공 시 교체
    title: p.title,
    author: typeof p.user === "string" ? p.user : "익명",
    dateText: toYYMMDD(p.created_at),
    views: p.view_count ?? 0,
    likes: p.like_count ?? 0,
  };
}

/** 본문에서 첫 줄을 추출(HTML 제거 포함, 없으면 빈 문자열) */
function deriveDescFromItem(item: PostListItem): string {
  // TODO[API-DESC-ORDER]: 서버 스펙 확정 시 우선순위 정렬(예: summary > desc > excerpt > content > body)
  const anyItem = item as unknown as Record<string, unknown>;
  const pick = (...keys: string[]) =>
    keys.map((k) => anyItem[k]).find((v) => typeof v === "string") as
      | string
      | undefined;

  const src0 =
    pick("summary", "excerpt", "desc", "description", "content", "body") ?? "";
  if (!src0) return "";

  // TODO[API-DESC-HTML]: 서버가 항상 plaintext라면 아래 2줄 제거
  const src1 = src0.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
  const firstLine = src1.split(/\r?\n/).find((line) => line.trim().length > 0);
  return (firstLine ?? "").trim();
}

function computeStatus(endISO?: string): SurveyStatus {
  if (!endISO) return "active";
  const end = new Date(endISO).getTime();
  return Number.isFinite(end) && end < Date.now() ? "expired" : "active";
}

/** 목록 아이템 + (선택)추가정보 → 카드 프롭스 */
export function mapToSurveyCard(
  item: PostListItem,
  extra?: SurveyExtra
): SurveyCardProps {
  const desc = deriveDescFromItem(item);
  // 서버 태그 변환(+ 임시 fallback)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertedTags = mapTagsFromApi((item as any).tags);
  const tags =
    convertedTags.length > 0
      ? convertedTags
      : profileToTagsMock("11기", "프론트"); // TODO[API-TAGS]: 서버 태그 안정화되면 fallback 제거

  return {
    id: String(item.id),
    title: item.title,
    desc: desc || undefined, // 빈문자면 렌더 생략
    link: extra?.link,
    deadline: extra?.end_date ?? "", // TODO[API-EXTRA]: 값 미제공 시 undefined로 바꿔도 됨
    status: computeStatus(extra?.end_date),
    tags,
  };
}
