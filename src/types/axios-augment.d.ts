import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /** 이 요청에 Authorization을 붙이지 않음 */
    skipAuth?: boolean;
    /** 쿠키 인증 시에만 true (withCredentials) */
    useCookie?: boolean;
    /** 401이면 refresh 재시도할지 여부 (기본 true) */
    retryOn401?: boolean;
    /** 이 요청은 인증이 필요한 엔드포인트임을 표시(리프레시 로직용) */
    authRequired?: boolean;
  }

  interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    useCookie?: boolean;
    retryOn401?: boolean;
    authRequired?: boolean;
  }
}
