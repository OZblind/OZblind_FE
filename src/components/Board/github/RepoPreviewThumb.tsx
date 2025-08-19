import { memo } from "react";
import { FaGithub } from "react-icons/fa";
import { useGithubRepo } from "@hooks/useGithubRepo";
import { parseGithubRepo } from "@utils/parseGithub";

/** RepoPreviewCard에서 실제로 쓰는 필드 중 이 썸네일에 필요한 최소 집합 */
type MinimalRepo = {
  name?: string;
  full_name?: string;
  html_url?: string;
  language?: string;
  /** 백엔드/훅에서 제공되면 언어 컬러 바로 사용 */
  language_color?: string;
  owner?: {
    login?: string;
    avatar_url?: string;
    html_url?: string;
  };
};

export type RepoPreviewThumbProps = {
  /** 예: https://github.com/{owner}/{repo} */
  repoLink: string;
  className?: string;
};

/**
 * RepoPreviewCard와 동일한 데이터 소스(useGithubRepo/parseGithubRepo)를 사용하되,
 * 카드 '썸네일 영역'에 맞춘 콤팩트 UI.
 * - 부모 컨테이너의 w/h를 꽉 채운다.
 * - 로딩/에러/잘못된 URL 모두 처리.
 */
const RepoPreviewThumb = memo(function RepoPreviewThumb({
  repoLink,
  className = "",
}: RepoPreviewThumbProps) {
  const { data, loading, error } = useGithubRepo(repoLink);
  const parsed = parseGithubRepo(repoLink);

  // RepoPreviewCard와 동일하게 훅 데이터를 우선 사용(필요한 필드만 선택)
  const repo = (data as MinimalRepo | undefined) ?? undefined;

  const ownerName = repo?.owner?.login ?? parsed?.owner ?? "github";
  const repoName = repo?.name ?? parsed?.repo ?? "repository";
  const avatarUrl =
    repo?.owner?.avatar_url ??
    (ownerName ? `https://github.com/${ownerName}.png?size=80` : undefined);
  const langColor = repo?.language_color ?? "rgba(98,1,224,0.7)";

  // 잘못된 URL이거나 파싱 실패 & 데이터도 없는 경우
  const invalid = !parsed && !repo;

  return (
    <div
      className={
        "relative w-full h-full rounded-lg overflow-hidden bg-base-200 " +
        className
      }
      title={
        repo?.full_name ??
        (parsed ? `${parsed.owner}/${parsed.repo}` : repoLink)
      }
      aria-busy={loading ? "true" : "false"}
    >
      {/* 상단 미니 헤더 영역 */}
      <div className="absolute inset-x-0 top-0 px-2 py-1.5 flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-base-300 overflow-hidden shrink-0 grid place-items-center">
          {avatarUrl && !error ? (
            <img
              src={avatarUrl}
              alt="아바타"
              className="w-full h-full object-cover"
            />
          ) : (
            <FaGithub className="opacity-60" size={12} />
          )}
        </div>

        <div className="min-w-0 leading-tight">
          <div className="text-[11px] opacity-70 truncate">{ownerName}</div>
          <div className="text-xs font-semibold truncate">
            {loading ? "불러오는 중…" : repoName}
          </div>
        </div>
      </div>

      {/* 본문 상태: 로딩/에러/유효성 안내(썸네일 영역이므로 간결하게) */}
      {(loading || error || invalid) && (
        <div className="absolute inset-0 grid place-items-center text-[11px] text-base-content/60">
          {loading
            ? "Loading…"
            : error
              ? "Failed to load"
              : "GitHub 레포 URL을 확인하세요"}
        </div>
      )}

      {/* 하단 언어 컬러 바 */}
      <div
        className="absolute left-0 right-0 bottom-0 h-1.5"
        style={{ backgroundColor: langColor }}
      />
    </div>
  );
});

export default RepoPreviewThumb;
