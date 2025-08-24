import { useEffect } from "react";
import { useNewNotificationFlag } from "./useNotifications";

export function useNewFlagEvery30s() {
  const { hasNew, refetch } = useNewNotificationFlag(30_000);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refetch]);

  return hasNew;
}
