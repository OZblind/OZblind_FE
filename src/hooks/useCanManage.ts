import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useAuthStore, type AuthState } from "@src/store/authStore";

type Options = {
  allowAdmin?: boolean; // 기본값 true
  allowModerator?: boolean; // 필요 시 true
  extraRoles?: string[]; // 추가 허용 역할
};

export function useCanManage(authorId?: string | null, opts: Options = {}) {
  const { allowAdmin = true, allowModerator = false, extraRoles = [] } = opts;

  // useShallow 로 래핑 → useAuthStore 인자 1개만 전달
  const { userId, role } = useAuthStore(
    useShallow((s: AuthState) => ({
      userId: s.user?.userId,
      role: s.user?.role,
    }))
  );

  const isOwner = useMemo(() => {
    if (!authorId || !userId) return false;
    return userId === authorId;
  }, [authorId, userId]);

  const isAdmin = useMemo(
    () => allowAdmin && role === "admin",
    [allowAdmin, role]
  );

  const isModerator = useMemo(
    () => allowModerator && role === "moderator",
    [allowModerator, role]
  );

  const hasExtraRole = useMemo(
    () => (extraRoles.length ? extraRoles.includes(role ?? "") : false),
    [extraRoles, role]
  );

  const canManage = isOwner || isAdmin || isModerator || hasExtraRole;

  return {
    canManage,
    isOwner,
    isAdmin,
    isModerator,
    hasExtraRole,
    currentUserId: userId,
    role,
  };
}

// 선택: 배열/아이템을 조건부로 펼칠 때 편의 헬퍼
export function onlyWhen<T>(cond: boolean, items: T[] | T): T[] {
  if (!cond) return [];
  return Array.isArray(items) ? items : [items];
}
