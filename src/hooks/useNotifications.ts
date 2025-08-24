import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markAllRead as apiMarkAllRead,
  deleteAllNotifications as apiDeleteAll,
  markOneRead as apiMarkOneRead,
  deleteOne as apiDeleteOne,
  checkNew as apiCheckNew,
  type ApiNotification,
} from "@api/notifications";
import { mapApiToNotice } from "@src/features/notifications/notice.adapter";
import type { Notification } from "@components/Notice/notice.types";

const QK = {
  list: ["notifications", "list"] as const,
  check: ["notifications", "check"] as const,
};

export function useNotificationList() {
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QK.list,
    queryFn: fetchNotifications,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    networkMode: "always",
  });

  const items: Notification[] = useMemo(
    () => (data ?? []).map(mapApiToNotice),
    [data]
  );

  const markAllRead = useMutation({
    mutationFn: apiMarkAllRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: QK.list });
      const prev = qc.getQueryData<ApiNotification[]>(QK.list);
      qc.setQueryData<ApiNotification[]>(QK.list, (curr) =>
        (curr ?? []).map((n) => ({ ...n, is_read: true }))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK.list, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.list });
      qc.invalidateQueries({ queryKey: QK.check });
    },
  });

  const deleteAll = useMutation({
    mutationFn: apiDeleteAll,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: QK.list });
      const prev = qc.getQueryData<ApiNotification[]>(QK.list);
      qc.setQueryData<ApiNotification[]>(QK.list, []);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK.list, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.list });
      qc.invalidateQueries({ queryKey: QK.check });
    },
  });

  const markOne = useMutation({
    mutationFn: apiMarkOneRead,
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: QK.list });
      const prev = qc.getQueryData<ApiNotification[]>(QK.list);
      qc.setQueryData<ApiNotification[]>(QK.list, (curr) =>
        (curr ?? []).map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK.list, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.list });
      qc.invalidateQueries({ queryKey: QK.check });
    },
  });

  const deleteOne = useMutation({
    mutationFn: apiDeleteOne,
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: QK.list });
      const prev = qc.getQueryData<ApiNotification[]>(QK.list);
      qc.setQueryData<ApiNotification[]>(QK.list, (curr) =>
        (curr ?? []).filter((n) => n.id !== id)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK.list, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.list });
      qc.invalidateQueries({ queryKey: QK.check });
    },
  });

  return {
    items,
    isLoading,
    isError,
    refetch,
    markAllRead,
    deleteAll,
    markOne,
    deleteOne,
  };
}

/** 30초 폴링 전역 플래그 */
export function useNewNotificationFlag(pollMs = 30_000) {
  const q = useQuery({
    queryKey: QK.check,
    queryFn: apiCheckNew,
    refetchInterval: pollMs,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    networkMode: "always",
  });
  return { hasNew: q.data?.new ?? false, refetch: q.refetch };
}
