/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useAuthStore, type AuthState } from "@src/store/authStore";

type Options = {
  allowAdmin?: boolean; // 기본 true
  allowModerator?: boolean; // 필요 시 true
  extraRoles?: string[]; // 추가 허용 역할 (예: ["editor"])
};

type AuthorId = string | number | null | undefined;

function normalizeAuthorId(authorId?: AuthorId): string | undefined {
  if (authorId == null) return undefined;

  // 객체가 들어오는 실수 방어
  if (typeof authorId === "object") {
    const objId = (authorId as any)?.id ?? (authorId as any)?.user_id;
    return objId != null ? String(objId) : undefined;
  }

  const s = String(authorId).trim();
  if (!s || s.startsWith("[object")) return undefined; // "[object Object]" 방어
  return s;
}

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
  const authorIdStr = useMemo(() => normalizeAuthorId(authorId), [authorId]);

  const isOwner = useMemo(() => {
    if (!authorIdStr || !currentUserId) return false;
    return authorIdStr === currentUserId;
  }, [authorIdStr, currentUserId]);

  const isAdmin = role === "admin" || role === "administrator";

  const isModeratorRole =
    role === "moderator" || role === "staff" || role === "manager";

  const hasExtraRole =
    !!role && extraRoles.map((r) => r.toLowerCase()).includes(role);

  const canManage =
    isOwner ||
    (allowAdmin && isAdmin) ||
    (allowModerator && isModeratorRole) ||
    hasExtraRole;

  return {
    canManage,
    isOwner,
    isAdmin,
    isModerator: isModeratorRole,
    hasExtraRole,
    currentUserId,
    role, // 소문자
  };
}

// 조건부로 배열/아이템 펼치기
export function onlyWhen<T>(cond: boolean, items: T[] | T): T[] {
  return cond ? (Array.isArray(items) ? items : [items]) : [];
}
