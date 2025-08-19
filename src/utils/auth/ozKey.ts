import { ENV } from "@src/config/env";

/** "…COHORT11" 패턴에서 11 추출 */
export function parseCohortFromKey(plainKey: string): number | null {
  const m = plainKey.match(/COHORT(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

/** 로컬(프론트) 1차 검증: env와 문자열 일치 */
export function isValidOzKeyLocal(plainKey: string): boolean {
  const expected = ENV.DEFAULT_PLAIN_KEY?.trim();
  if (!expected) return true; // env 없으면 프론트 검증 skip
  return plainKey.trim() === expected;
}

/** 최종 코호트 번호 결정: 키에서 추출 → env fallback */
export function resolveCohortNumber(plainKey: string): number {
  const fromKey = parseCohortFromKey(plainKey);
  if (typeof fromKey === "number" && Number.isFinite(fromKey)) return fromKey;

  const fromEnv = Number(ENV.DEFAULT_COHORT);
  if (Number.isFinite(fromEnv)) return fromEnv;

  throw new Error("키에서 코호트 번호를 추출할 수 없습니다.");
}
