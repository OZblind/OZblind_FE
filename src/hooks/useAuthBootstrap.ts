import { useEffect, useState } from "react";
import { getCurrentUser } from "@api/auth";
import { useAuthStore } from "@store/authStore";

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
