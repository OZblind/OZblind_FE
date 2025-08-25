/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@api/client";
import { ENDPOINTS } from "@constants/endpoints";
import type { Tag } from "@src/types/tag";
import { pickFirst } from "@src/utils/pickFirst";
import { adaptUserTag } from "@src/features/tags/adapters";
import { fetchPostDetailSingleflight } from "./posts";

/** 서버의 오즈키 기반 태그 구조 (ex. /api/user/tag, /api/posts/:id user) */
export interface RawUserTag {
  id: number; // oz_key.id
  tag_class: "FE" | "BE"; // 포지션
  tag_number: number; // 기수 (예: 11)
}

/** 프로필 기반(구버전/목) 구조: 다양한 키들 중에서 기수/포지션 추출 */
interface RawUserProfile {
  id?: string | number;
  email?: string;
  user?: {
    cohort?: string | number;
    generation?: string | number;
    class?: string | number;
    term?: string | number;
    position?: string;
    role?: string;
    track?: string;
    job?: string;
  };
  cohort?: string | number;
  generation?: string | number;
  class?: string | number;
  term?: string | number;
  position?: string;
  role?: string;
  track?: string;
  job?: string;
}

/** 프로필 → "11기" 정규화 */
function normalizeCohort(raw: RawUserProfile): string | null {
  const value = pickFirst(
    raw?.cohort,
    raw?.generation,
    raw?.class,
    raw?.term,
    raw?.user?.cohort,
    raw?.user?.generation,
    raw?.user?.class,
    raw?.user?.term
  );
  if (value == null) return null;
  if (typeof value === "number") return `${value}기`;
  const s = String(value).trim();
  return /기$/.test(s) ? s : `${s}기`;
}

/** 프로필 → 포지션 문자열 정규화 */
function normalizePosition(raw: RawUserProfile): string | null {
  const value = pickFirst(
    raw?.position,
    raw?.role,
    raw?.track,
    raw?.job,
    raw?.user?.position,
    raw?.user?.role,
    raw?.user?.track,
    raw?.user?.job
  );
  return value == null ? null : String(value).trim();
}

/** 프로필 응답 → Tag[] */
function normalizeUserToAssignedTags(raw: RawUserProfile): Tag[] {
  const cohort = normalizeCohort(raw);
  const position = normalizePosition(raw);
  const tags: Tag[] = [];
  if (cohort)
    tags.push({
      id: `cohort-${cohort.replace(/기$/, "")}`,
      label: cohort,
      category: "cohort",
    });
  if (position)
    tags.push({
      id: `position-${position}`,
      label: position,
      category: "position",
    });
  return tags;
}

/** 유틸: Tag[]가 “cohort 1 + position 1”인지 검사 */
export function isValidAssigned(tags: Tag[]): boolean {
  const c = tags.filter((t) => t.category === "cohort").length === 1;
  const p = tags.filter((t) => t.category === "position").length === 1;
  return c && p;
}

/** [ME] 현재 로그인 사용자 태그 (오즈키 우선 → 프로필 폴백). 목에서도 동작. */
export async function getMyAssignedTags(): Promise<Tag[]> {
  // 1) v2 오즈키 우선
  try {
    const { data, status } = await api.get<RawUserTag | null>(
      ENDPOINTS.USER_TAG,
      { withCredentials: true }
    );
    if (status !== 401 && data) {
      const v2 = adaptUserTag(data);
      if (v2.length > 0) return v2;
    }
  } catch {
    // 무해하게 폴백
  }

  // 2) v1 프로필 폴백 (목/구버전)
  try {
    const { data } = await api.get<RawUserProfile>(ENDPOINTS.USER_PROFILE, {
      withCredentials: true,
    });
    return normalizeUserToAssignedTags(data);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to load assigned tags";
    throw new Error(message);
  }
}

/**
 * [AUTHOR] 게시글 작성자 태그
 * - 우선: post.user(오즈키 구조)가 있다면 즉시 변환 (네트워크 X)
 * - 없으면: "캐시된 상세"에서 user 추출 (중복 호출 없음)
 * - 마지막 폴백: 정말 필요할 때만 상세 GET (가능하면 지양)
 */
export async function getAuthorAssignedTags(opts: {
  postId?: string | number;
  inlineUser?: RawUserTag | null;
}): Promise<Tag[]> {
  // 인라인 있으면 절대 네트워크 안 칩니다.
  if (opts.inlineUser !== undefined && opts.inlineUser !== null) {
    return adaptUserTag(opts.inlineUser);
  }
  if (opts.postId == null) return [];
  // 동시중복만 합치고 바로 반환(캐시 없음)
  const post: any = await fetchPostDetailSingleflight(opts.postId);
  return adaptUserTag(post?.user ?? null);
}
