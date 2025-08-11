// 사용자 최초 의도 경로 저장 헬퍼

import { Navigate, type Location } from "react-router-dom";
import { setIntendedPath } from "@utils/routerIntent";

/** 사용자가 곧바로 보호 라우트 접근 시, 요청한 경로를 '의도 경로'로 저장하고 이동 */
export function redirectWithIntent(to: string, location: Location) {
  setIntendedPath(location.pathname + location.search);
  return <Navigate to={to} replace />;
}
