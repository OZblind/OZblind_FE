import { PATHS } from "@constants/paths";
import { getIntendedPath, clearIntendedPath } from "@utils/routerIntent";

/**
 * 로그인/가입 직후 이동 경로 결정
 * - 미인증(false): 먼저 PATHS.KEY_VERIFY 로 보낸다. (의도 경로는 그대로 보존)
 * - 인증(true): 의도 경로가 있으면 복구하고, 없으면 /main
 */
export function resolvePostLoginPath(isOzAuthenticated: boolean) {
  const intended = getIntendedPath();

  if (!isOzAuthenticated) {
    // 아직 오즈키 미인증 → 의도 경로는 건드리지 말고 유지
    return PATHS.KEY_VERIFY;
  }

  // 인증 완료 → 의도 경로 있으면 복구 후 삭제, 없으면 /main
  if (intended) {
    clearIntendedPath();
    return intended;
  }
  return PATHS.MAIN;
}
