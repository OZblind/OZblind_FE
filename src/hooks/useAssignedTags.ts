import { useEffect, useState } from "react";
import { getMyAssignedTags } from "@api/tags";
import type { Tag } from "@src/types/tag";

function isValid(tags: Tag[]): boolean {
  const cohort = tags.filter((t) => t.category === "cohort").length === 1;
  const position = tags.filter((t) => t.category === "position").length === 1;
  return cohort && position;
}

export function useAssignedTags() {
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
        const result = await getMyAssignedTags();
        if (cancelled) return;
        setTags(result);
        setValid(isValid(result));
        if (!isValid(result)) setError("기수 1개 + 포지션 1개가 필요합니다.");
      } catch (e: unknown) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "태그를 불러오지 못했습니다."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tags, loading, error, valid };
}
