import { useEffect, useMemo, useRef, useState } from "react";
import { fetchRemoteOK, fetchArbeitnow, fetchAshby } from "@src/api/jobs";
import type { JobCard, Source } from "@src/types/job";

type UseJobsOpts = { ashby?: string; gh?: string; chunkSize?: number };

export function useJobs(source: Source, opts: UseJobsOpts) {
  const chunkSize = opts.chunkSize ?? 10;

  const [all, setAll] = useState<JobCard[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(chunkSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 중복 요청 방지용 alive 플래그
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    setAll([]);
    setError(null);
    setLoading(true);
    setVisibleCount(chunkSize); // 탭 전환 시 초기 청크로 리셋

    (async () => {
      try {
        let jobs: JobCard[] = [];
        if (source === "remoteok") jobs = await fetchRemoteOK();
        if (source === "arbeitnow") jobs = await fetchArbeitnow();
        if (source === "ashby" && opts.ashby)
          jobs = await fetchAshby(opts.ashby);

        if (!aliveRef.current) return;

        // 중복 제거 + 최신순 정렬
        const map = new Map<string, JobCard>();
        for (const j of jobs) map.set(j.id || j.url, j);
        const sorted = Array.from(map.values()).sort((a, b) =>
          (b.publishedAt ?? "") > (a.publishedAt ?? "") ? 1 : -1
        );

        setAll(sorted);
      } catch (e) {
        if (!aliveRef.current) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    })();

    return () => {
      aliveRef.current = false;
    };
    // source/키 변경 시 재요청
  }, [source, opts.ashby, opts.gh, chunkSize]);

  // 화면에 노출할 슬라이스
  const data = useMemo(() => all.slice(0, visibleCount), [all, visibleCount]);

  // 더 보여줄 수 있는지
  const canShowMore = visibleCount < all.length;

  // 외부에서 호출: 다음 청크만큼 가시 개수 늘리기
  const showMore = (by?: number) => {
    setVisibleCount((prev) => Math.min(all.length, prev + (by ?? chunkSize)));
  };

  // 특정 인덱스로 슬라이드가 이동했을 때, 끝에 가까우면 미리 늘리기(옵션)
  const ensureVisibleUpTo = (index: number, buffer = 0) => {
    const needed = index + 1 + buffer;
    if (needed > visibleCount) {
      setVisibleCount((prev) => Math.min(all.length, Math.max(prev, needed)));
    }
  };

  return {
    data,
    total: all.length,
    loading,
    error,
    canShowMore,
    showMore,
    ensureVisibleUpTo,
  };
}
