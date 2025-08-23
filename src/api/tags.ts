// =========================== API 이전 버전 (명우) ===========================

// 회원 프로필 기반으로 "기수 1개 + 포지션 1개" 자동 지정 태그를 조회하는 API 모듈.
// 참고: @api/client (axios 인스턴스/401 재시도), auth.ts 의 pickFirst/ENDPOINTS 사용 패턴과 동일.

import { api } from "@api/client";
import { ENDPOINTS } from "@constants/endpoints";
import type { Tag } from "@src/types/tag";
import { pickFirst } from "@src/utils/pickFirst";

/** 서버가 다양한 스키마로 줄 수 있으니, 최대한 유연하게 받기 위한 타입 (any 금지) */
interface RawUserProfile {
  // 공통
  id?: string | number;
  email?: string;

  // 최상위 혹은 user 객체 안에 있을 수 있는 프로필 필드들
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

/** "11기" 처럼 표시용 문자열로 정규화 */
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

  // 숫자 11 -> "11기", "11기" -> 그대로
  if (typeof value === "number") return `${value}기`;
  const s = String(value).trim();
  // 이미 "기"가 붙어있으면 통과, 아니면 붙여줌
  return /기$/.test(s) ? s : `${s}기`;
}

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
  if (value == null) return null;
  return String(value).trim();
}

const COHORT_ID = (cohort: string) => `cohort-${cohort.replace(/기$/, "")}`;
const POSITION_ID = (position: string) => `position-${position}`;

/** 서버 응답 → Tag[] (cohort 1 + position 1) */
export function normalizeUserToAssignedTags(raw: RawUserProfile): Tag[] {
  const cohort = normalizeCohort(raw);
  const position = normalizePosition(raw);

  const tags: Tag[] = [];
  if (cohort) {
    tags.push({
      id: COHORT_ID(cohort),
      label: cohort,
      category: "cohort",
    });
  }
  if (position) {
    tags.push({
      id: POSITION_ID(position),
      label: position,
      category: "position",
    });
  }
  return tags;
}

/** 내 프로필(/me)에서 태그 2개를 가져옴 */
export async function getMyAssignedTags(): Promise<Tag[]> {
  try {
    const { data } = await api.get<RawUserProfile>(ENDPOINTS.USER_PROFILE);
    return normalizeUserToAssignedTags(data);
  } catch (e: unknown) {
    // auth.ts 스타일: unknown → Error 내로우잉
    const message =
      e instanceof Error ? e.message : "Failed to load assigned tags";
    throw new Error(message);
  }
}

// =========================== API 연결 버전 (서연) ===========================

// 오즈키 응답 → Tag[] 변환 어댑터
import { adaptUserTag } from "@src/features/tags/adapters";

// 서버의 user 태그 응답 형태
export interface RawUserTag {
  id: number; // oz_key.id
  tag_class: "FE" | "BE"; // 포지션 코드
  tag_number: number; // 기수 (예: 11)
}

/**
 * 현재 로그인 사용자 태그
 * - 성공: cohort("11기") + position("프론트/백엔드") 2개 반환
 * - 401: 빈 배열 반환(미노출)
 */
export async function getMyAssignedTagsFromOzKey(): Promise<Tag[]> {
  try {
    const { data, status } = await api.get<RawUserTag | null>(
      ENDPOINTS.USER_TAG,
      { withCredentials: true }
    );
    if (status === 401 || !data) return [];
    return adaptUserTag(data);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to load oz-key assigned tags";
    throw new Error(message);
  }
}

/**
 * 게시글 작성자 태그
 * - GET /api/posts/:id/ (주의: 끝에 슬래시 포함. 예: /api/posts/4/)
 * - 응답 내 data.user 가 RawUserTag
 */
export async function getPostAuthorAssignedTags(
  postId: string | number
): Promise<Tag[]> {
  try {
    const url = `${ENDPOINTS.POST_DETAIL}/${postId}/`;
    const { data } = await api.get<{ user?: RawUserTag | null }>(url, {
      withCredentials: true,
    });
    return adaptUserTag(data?.user ?? null);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to load post author tags";
    throw new Error(message);
  }
}
