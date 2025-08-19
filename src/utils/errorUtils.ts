// 에러 처리 관련 유틸리티 함수들

import { ERROR_MESSAGES } from "@src/constants/ui";

// 함수 타입 정의
type AnyFunction = (...args: never[]) => unknown;

/**
 * 안전한 함수 실행 (undefined 체크 포함)
 */
export const safeExecute = <T extends AnyFunction>(
  fn: T | undefined,
  ...args: Parameters<T>
): ReturnType<T> | undefined => {
  if (typeof fn === "function") {
    try {
      return fn(...args) as ReturnType<T>;
    } catch (error) {
      console.error("Function execution failed:", error);
      return undefined;
    }
  }
  return undefined;
};

/**
 * 안전한 콜백 실행 (화살표 함수 스타일)
 */
export const safeCallback =
  <T extends AnyFunction>(callback?: T) =>
  (...args: Parameters<T>): ReturnType<T> | void => {
    return safeExecute(callback, ...args);
  };

/**
 * 에러 메시지 정규화
 */
export const normalizeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return ERROR_MESSAGES.UNKNOWN;
};

/**
 * 안전한 배열 접근
 */
export const safeArrayAccess = <T>(
  array: T[] | undefined | null,
  index: number,
  defaultValue?: T
): T | undefined => {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index];
};

/**
 * 안전한 객체 프로퍼티 접근
 */
export const safeObjectAccess = <T, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined => {
  if (!obj || typeof obj !== "object") {
    return defaultValue;
  }
  return obj[key] ?? defaultValue;
};

/**
 * 안전한 숫자 변환
 */
export const safeParseInt = (
  value: string | number | undefined | null,
  defaultValue: number = 0
): number => {
  if (typeof value === "number" && !isNaN(value)) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
};

/**
 * 안전한 문자열 변환
 */
export const safeString = (
  value: unknown,
  defaultValue: string = ""
): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return defaultValue;
  }

  try {
    return String(value);
  } catch {
    return defaultValue;
  }
};

/**
 * 안전한 제목 자르기 (ellipsis)
 */
export const safeTruncate = (
  text: string | undefined | null,
  maxLength: number,
  ellipsis: string = "..."
): string => {
  const safeText = safeString(text);

  if (safeText.length <= maxLength) {
    return safeText;
  }

  return safeText.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * 타입 가드: 유효한 함수인지 확인
 */
export const isValidFunction = (fn: unknown): fn is AnyFunction => {
  return typeof fn === "function";
};

/**
 * 타입 가드: 빈 값이 아닌지 확인
 */
export const isNotEmpty = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * 타입 가드: 유효한 배열인지 확인
 */
export const isValidArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

/**
 * 안전한 이벤트 핸들러 생성
 */
export const createSafeEventHandler =
  <T extends Event>(
    handler: ((event: T) => void) | undefined,
    preventDefault: boolean = false,
    stopPropagation: boolean = false
  ) =>
  (event: T): void => {
    try {
      if (preventDefault) {
        event.preventDefault();
      }

      if (stopPropagation) {
        event.stopPropagation();
      }

      if (isValidFunction(handler)) {
        handler(event);
      }
    } catch (error) {
      console.error("Event handler failed:", error);
    }
  };

/**
 * 비동기 함수 안전 실행
 */
export const safeAsyncExecute = async <T>(
  asyncFn: (() => Promise<T>) | undefined,
  onError?: (error: unknown) => void
): Promise<T | undefined> => {
  if (!isValidFunction(asyncFn)) {
    return undefined;
  }

  try {
    return await asyncFn();
  } catch (error) {
    console.error("Async function failed:", error);
    if (onError && isValidFunction(onError)) {
      onError(error);
    }
    return undefined;
  }
};
