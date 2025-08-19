import { memo, useEffect, useMemo, useRef, useState } from "react";
import { parseGithubRepo } from "@utils/parseGithub";

export type RepoPreviewThumbProps = {
  /** 예: https://github.com/{owner}/{repo} */
  repoLink: string;
  className?: string;
  /**
   * auto           : 이미지 원본 비율로 컨테이너 높이를 계산(잘림 없음)
   * square-contain : 정방형 박스 + contain(레터박스 허용, 잘림 없음)
   */
  display?: "auto" | "square-contain";
  /** 로딩 전 임시 비율 (auto 모드에서만) */
  fallbackAspect?: "video" | "square" | "golden" | number; // 16:9 | 1:1 | 1.618 | 커스텀
};

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      options
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options]);
  return { ref, inView };
}

const ratioToPadding = (ratio: number) => `${(1 / ratio) * 100}%`;

const RepoPreviewThumb = memo(function RepoPreviewThumb({
  repoLink,
  className = "",
  display = "auto",
  fallbackAspect = 2, // GitHub OG는 보통 1200x600 ≈ 2:1
}: RepoPreviewThumbProps) {
  const parsed = parseGithubRepo(repoLink);
  const owner = parsed?.owner ?? "github";
  const repo = parsed?.repo ?? "repository";

  const { ref, inView } = useInView({ rootMargin: "200px 0px" });

  // 공개 OG 이미지(토큰 X)
  const ogUrl = useMemo(
    () => `https://opengraph.githubassets.com/1/${owner}/${repo}`,
    [owner, repo]
  );

  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null); // width / height

  useEffect(() => {
    if (!inView || !parsed) return;
    setSrc(ogUrl);
  }, [inView, ogUrl, parsed]);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setRatio(img.naturalWidth / img.naturalHeight);
    }
    setLoaded(true);
  };

  // auto 모드: 실제 비율(or 임시 비율)로 컨테이너 높이 확보
  const fallbackRatio =
    typeof fallbackAspect === "number"
      ? fallbackAspect
      : fallbackAspect === "square"
        ? 1
        : fallbackAspect === "golden"
          ? 1.618
          : 16 / 9;

  const paddingBottom = ratioToPadding(ratio ?? fallbackRatio);

  return (
    <div
      ref={ref}
      className={[
        "relative w-full rounded-lg overflow-hidden bg-base-200",
        display === "square-contain" ? "aspect-square" : "",
        className,
      ].join(" ")}
      title={parsed ? `${owner}/${repo}` : repoLink}
    >
      {/* auto: 비율 상자로 높이 확보 → 원본 비율에 딱 맞춤 */}
      {display === "auto" && <div style={{ paddingBottom }} />}

      {src && (
        <img
          src={src}
          alt={`${owner}/${repo} preview`}
          onLoad={onImgLoad}
          className={
            display === "square-contain"
              ? "absolute inset-0 w-full h-full object-contain"
              : "absolute inset-0 w-full h-full object-contain"
          }
          decoding="async"
          loading="lazy"
          style={
            display === "square-contain"
              ? { backgroundColor: "var(--fallback-b1, rgba(0,0,0,0.06))" }
              : undefined
          }
        />
      )}

      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-base-300/40" />
      )}
    </div>
  );
});

export default RepoPreviewThumb;
