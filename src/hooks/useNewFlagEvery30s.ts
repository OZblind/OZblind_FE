import { useEffect } from "react";
import { useNewNotificationFlag } from "./useNotifications";

export function useNewFlagEvery30s(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  const { hasNew, refetch } = useNewNotificationFlag(30_000);

  useEffect(() => {
    if (!enabled) return;
    const onVis = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [enabled, refetch]);

  return hasNew;
}
