import { useEffect, useState } from "react";
import { getCurrentUser } from "@api/auth";
import { useAuthStore } from "@store/authStore";

import { forceAuth } from "@utils/auth/forceAuth";

// 개발 테스트용
export function useAuthBootstrap() {
  const set = useAuthStore((s) => s.setFromAuthPayload);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // 개발 강제 인증 플래그
      if (import.meta.env.DEV && import.meta.env.VITE_FORCE_AUTH === "true") {
        forceAuth();
        if (mounted) setLoading(false);
        return;
      }
      try {
        const p = await getCurrentUser();
        if (!mounted) return;
        set(p); // 서버 payload가 { user, tokens, isOzAuthenticated } 형태라고 가정
      } catch {
        // noop
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

/*
let bootOnce: Promise<void> | null = null; // 전역 1회 Promise

export function useAuthBootstrap() {
  const set = useAuthStore((s) => s.setFromAuthPayload);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!bootOnce) {
      bootOnce = (async () => {
        try {
          const p = await getCurrentUser();
          if (mounted) set(p);
        } catch {
          // noop: 랜딩 유지
        }
      })();
    }

    bootOnce.finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [set]);

  return { loading };
}
*/
