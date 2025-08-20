import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useAuthStore, type AuthState } from "@src/store/authStore";

type Options = {
  allowAdmin?: boolean; // 기본 true
  allowModerator?: boolean; // 필요 시 true
  extraRoles?: string[]; // 추가 허용 역할 (예: ["editor"])
};

type AuthorId = string | number | null | undefined;

export function useCanManage(authorId?: AuthorId, opts: Options = {}) {
  const { allowAdmin = true, allowModerator = false, extraRoles = [] } = opts;

  // store 필드명 맞추기: user.id / user.role
  const { currentUserId, role } = useAuthStore(
    useShallow((s: AuthState) => ({
      currentUserId:
        s.user?.id !== undefined && s.user?.id !== null
          ? String(s.user.id)
          : undefined,
      role: s.user?.role ? String(s.user.role).toLowerCase() : undefined,
    }))
  );

  // 비교를 문자열로 통일
  const authorIdStr =
    authorId !== undefined && authorId !== null ? String(authorId) : undefined;

  const isOwner = useMemo(() => {
    if (!authorIdStr || !currentUserId) return false;
    return currentUserId === authorIdStr;
  }, [authorIdStr, currentUserId]);

  const isAdmin = useMemo(
    () => !!(allowAdmin && role === "admin"),
    [allowAdmin, role]
  );

  const isModerator = useMemo(
    () => !!(allowModerator && role === "moderator"),
    [allowModerator, role]
  );

  const hasExtraRole = useMemo(() => {
    if (!extraRoles?.length || !role) return false;
    const lowered = extraRoles.map((r) => r.toLowerCase());
    return lowered.includes(role);
  }, [extraRoles, role]);

  const canManage = isOwner || isAdmin || isModerator || hasExtraRole;

  return {
    canManage,
    isOwner,
    isAdmin,
    isModerator,
    hasExtraRole,
    currentUserId,
    role, // 이미 소문자
  };
}

// 조건부로 배열/아이템 펼치기
export function onlyWhen<T>(cond: boolean, items: T[] | T): T[] {
  if (!cond) return [];
  return Array.isArray(items) ? items : [items];
}
