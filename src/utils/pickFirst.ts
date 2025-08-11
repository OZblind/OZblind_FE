/** null/undefined 를 건너뛰고 가장 먼저 "존재하는" 값을 반환 */
export function pickFirst<T>(
  ...values: Array<T | null | undefined>
): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

/** 빈 문자열("")도 건너뛰고 싶을 때 */
export function pickFirstNonEmpty(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}
