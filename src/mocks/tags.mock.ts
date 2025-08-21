// src/mocks/tags.mock.ts
/**
 * 목업 태그 데이터/헬퍼
 * - 기수(1~15) × 포지션(프론트/백엔드/풀스택/게임/창업/디자인/AI) 전 조합의 키를 생성
 * - 키 형식: OZ-<기수번호>-<직군코드>, 예) OZ-11-FE
 * - 반환 태그는 항상 2개: cohort 1개 + position 1개 (locked = true)
 */

import type { Tag } from "@src/types/tag";

// -----------------------------
// 기본 라벨(고정)
// -----------------------------
export const COHORTS = [
  "1기",
  "2기",
  "3기",
  "4기",
  "5기",
  "6기",
  "7기",
  "8기",
  "9기",
  "10기",
  "11기",
  "12기",
  "13기",
  "14기",
  "15기",
] as const;
export type CohortLabel = (typeof COHORTS)[number];

export const POSITIONS = [
  "프론트",
  "백엔드",
  "풀스택",
  "게임",
  "창업",
  "디자인",
  "AI",
] as const;
export type PositionLabel = (typeof POSITIONS)[number];

// -----------------------------
// 키 생성 규칙
// -----------------------------
const POSITION_CODE: Record<PositionLabel, string> = {
  프론트: "FE",
  백엔드: "BE",
  풀스택: "FS",
  게임: "GM",
  창업: "ENT",
  디자인: "DS",
  AI: "AI",
};

const CODE_TO_POSITION: Record<string, PositionLabel> = {
  FE: "프론트",
  BE: "백엔드",
  FS: "풀스택",
  GM: "게임",
  ENT: "창업",
  DS: "디자인",
  AI: "AI",
};

const cohortNumber = (cohort: CohortLabel): number =>
  Number(cohort.replace("기", ""));

const cohortId = (cohort: CohortLabel): string =>
  `cohort-${cohortNumber(cohort)}`;

const positionId = (position: PositionLabel): string => `position-${position}`;

export const buildKey = (
  cohort: CohortLabel,
  position: PositionLabel
): string => `OZ-${cohortNumber(cohort)}-${POSITION_CODE[position]}`;

// -----------------------------
// 태그 생성기
// -----------------------------
export const makeAssignedTags = (
  cohort: CohortLabel,
  position: PositionLabel
): Tag[] => [
  { id: cohortId(cohort), label: cohort, category: "cohort" },
  {
    id: positionId(position),
    label: position,
    category: "position",
  },
];

// -----------------------------
// 전체 키 → 태그 맵(1~15기 × 7포지션 = 105개)
// -----------------------------
export const MOCK_ASSIGNED_TAGS_BY_KEY: Record<string, Tag[]> =
  Object.fromEntries(
    COHORTS.flatMap((c) =>
      POSITIONS.map((p) => [buildKey(c, p), makeAssignedTags(c, p)] as const)
    )
  );

// -----------------------------
// 파서/조회 목업 API
// -----------------------------
const KEY_RE = /^OZ-(\d+)-([A-Z]+)$/;

/** 키 문자열을 태그 2개로 파싱 (형식 불일치/미지원 코드면 null) */
export function parseKeyToTags(key: string): Tag[] | null {
  const m = KEY_RE.exec(key.trim());
  if (!m) return null;
  const [, numStr, code] = m;
  const num = Number(numStr);

  const position = CODE_TO_POSITION[code];
  const cohort = (
    num >= 1 && num <= 15 ? `${num}기` : null
  ) as CohortLabel | null;

  if (!position || !cohort) return null;
  return makeAssignedTags(cohort, position);
}

/**
 * 네트워크 흉내: 키로 태그를 비동기 반환(지연/에러 시뮬 가능)
 * @throws Error - 키가 유효하지 않으면 throw
 */
export async function getAssignedTagsByKeyMock(
  key: string,
  opts: { delayMs?: number; useParser?: boolean } = {}
): Promise<Tag[]> {
  const { delayMs = 150, useParser = false } = opts;

  // 지연 시뮬레이션
  await new Promise((r) => setTimeout(r, delayMs));

  if (useParser) {
    const parsed = parseKeyToTags(key);
    if (!parsed) throw new Error("Invalid designated key");
    return parsed;
  }

  const tags = MOCK_ASSIGNED_TAGS_BY_KEY[key];
  if (!tags) throw new Error("Invalid designated key");
  return tags;
}

/** 프로필(기수/포지션 문자열) → 태그 2개로 변환 */
export function profileToTagsMock(cohort: string, position: string): Tag[] {
  // 안전 변환: CohortLabel/PositionLabel로 단언하기 전에 값 검증
  const c = COHORTS.find((v) => v === cohort);
  const p = POSITIONS.find((v) => v === position);
  if (!c || !p) {
    // 유효하지 않으면 빈 배열 반환(테스트 편의)
    return [];
  }
  return makeAssignedTags(c, p);
}
