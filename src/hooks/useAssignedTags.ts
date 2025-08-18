import { useEffect, useState } from "react";
import { fetchAssignedTagsByKey } from "@api/tags";
import { validateAssignedTags } from "@utils/tagRules";
import type { Tag } from "@src/types/tag";

export function useAssignedTags(designatedKey?: string) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!designatedKey) {
        setTags([]);
        setValid(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAssignedTagsByKey(designatedKey);
        if (cancelled) return;

        const v = validateAssignedTags(result);
        setValid(v.ok);
        setTags(result);
        if (!v.ok) {
          setError(
            `Invalid tag set: cohort=${v.cohortCount}, position=${v.positionCount} (need 1+1)`
          );
        }
      } catch (e: unknown) {
        if (!cancelled) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError("Failed to fetch assigned tags");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [designatedKey]);

  return { tags, loading, error, valid };
}
