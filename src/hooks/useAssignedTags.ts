import { useEffect, useState } from "react";
import type { Tag } from "@src/types/tag";
import {
  getMyAssignedTags,
  getAuthorAssignedTags,
  isValidAssigned,
} from "@api/tags";
import type { RawUserTag } from "@api/tags";

/**
 * target:
 *  - "me"     : 현재 로그인 사용자의 태그
 *  - "author" : 게시글 작성자의 태그
 *
 * author 옵션:
 *  - postId     : 상세 호출이 필요한 경우 사용
 *  - inlineUser : 응답에 이미 user { id, tag_class, tag_number }가 들어온 경우 전달
 *
 * 반환 형태는 기존 훅과 동일한 필드 포함: { tags, loading, error, valid }
 */
export function useAssignedTags(
  target: "me" | "author" = "me",
  author?: { postId?: string | number; inlineUser?: RawUserTag | null }
) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        let result: Tag[] = [];
        if (target === "me") {
          result = await getMyAssignedTags();
        } else {
          result = await getAuthorAssignedTags({
            postId: author?.postId,
            inlineUser: author?.inlineUser ?? null,
          });
        }
        if (cancelled) return;
        setTags(result);
        const ok = isValidAssigned(result);
        setValid(ok);
        if (!ok) setError("기수 1개 + 포지션 1개가 필요합니다.");
      } catch (e: unknown) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "태그를 불러오지 못했습니다."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    target,
    author?.postId,
    author?.inlineUser?.id,
    author?.inlineUser?.tag_class,
    author?.inlineUser?.tag_number,
  ]);

  return { tags, loading, error, valid };
}
