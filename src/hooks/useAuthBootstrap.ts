import { useEffect, useState } from "react";
import { getCurrentUser } from "@api/auth";
import { useAuthStore } from "@store/authStore";

/** 앱 진입 시 1회: JWT 토큰 유효하면 프로필 세팅, 실패하면 초기 상태 유지 */
export function useAuthBootstrap() {
  const set = useAuthStore((s) => s.setFromAuthPayload);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getCurrentUser();
        if (!mounted) return;
        set(p);
      } catch {
        // noop: 랜딩 유지
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [set]);

  return { loading };
}
