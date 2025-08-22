// src/hooks/useAuthBootstrap.ts
import { useEffect, useState } from "react";
import { getProfile } from "@api/auth";
import { tokenStore } from "@api/client";
import { useAuthStore } from "@store/authStore";
import type { User } from "@store/authStore";
import { forceAuth } from "@utils/auth/forceAuth";

/** JWT payload (일부만) */
interface JwtPayload {
  user_id?: string | number; // SIMPLE_JWT 기본 클레임명
}

/** access 토큰에서 user_id 안전 추출 → store의 user.id 로 사용 */
function extractUserIdFromAccess(access: string): string | number | undefined {
  if (!access) return undefined;
  try {
    const [, base64Url] = access.split(".");
    if (!base64Url) return undefined;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload: JwtPayload = JSON.parse(json);
    return payload.user_id;
  } catch {
    return undefined;
  }
}

/** 앱 최초 1회: 토큰/프로필 부팅 */
export function useAuthBootstrap() {
  const setFromAuthPayload = useAuthStore((s) => s.setFromAuthPayload);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1) 개발 강제 인증 플래그
      if (import.meta.env.DEV && import.meta.env.VITE_FORCE_AUTH === "true") {
        forceAuth();
        if (mounted) setLoading(false);
        return;
      }

      // 2) 토큰이 없으면 조용히 종료
      if (!tokenStore.access) {
        if (mounted) setLoading(false);
        return;
      }

      // 3) 토큰이 있으면 프로필 조회 → 스토어 세팅
      try {
        const p = await getProfile(); // { email, name?, profile_image? }
        if (!mounted) return;

        const userId = extractUserIdFromAccess(tokenStore.access);

        setFromAuthPayload({
          user: {
            id: userId as User["id"] | undefined,
            email: p.email,
            name: p.name,
            // 필요하면 다음 추가
            // profile_image: p.profile_image,
          },
          tokens: {
            accessToken: tokenStore.access || undefined,
            refreshToken: tokenStore.refresh || undefined,
          },
          isOzAuthenticated: true,
        });
      } catch {
        // 401 등 실패 시 스토어/토큰 정리
        setFromAuthPayload({
          user: null,
          tokens: { accessToken: undefined, refreshToken: undefined },
          isOzAuthenticated: false,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setFromAuthPayload]);

  return { loading };
}
