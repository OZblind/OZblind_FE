// GitRepoPostForm.tsx (일부만 수정)
import { useGithubRepo } from "@hooks/useGithubRepo";
import { parseGithubRepo } from "@utils/parseGithub";
import { FaGithub } from "react-icons/fa";

export function RepoPreviewCard({ repoLink }: { repoLink: string }) {
  const { data, loading, error } = useGithubRepo(repoLink);
  const parsed = parseGithubRepo(repoLink);

  if (error) {
    return (
      <div className="p-4 border rounded bg-white shadow-sm mt-1 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-white shadow-sm mt-1">
      <p className="font-semibold text-lg mb-2 flex items-center gap-2">
        <FaGithub className="text-gray-800" size={20} />
        레포 미리보기
      </p>

      {!parsed && (
        <p className="text-sm text-gray-600">GitHub 레포 URL을 입력해주세요.</p>
      )}

      {loading && (
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-3 w-2/3 bg-gray-200 rounded" />
          <div className="h-3 w-1/3 bg-gray-200 rounded" />
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-2">
          <a
            href={data.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
            title={data.full_name}
          >
            {data.full_name}
          </a>

          {data.description && (
            <p className="text-gray-700">{data.description}</p>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-700 flex-wrap">
            <span>⭐ {data.stargazers_count.toLocaleString()}</span>
            <span>🍴 {data.forks_count.toLocaleString()}</span>
            <span>🐞 이슈 {data.open_issues_count.toLocaleString()}</span>
            {data.license?.spdx_id && <span>📝 {data.license.spdx_id}</span>}
            {data.language && <span>🔤 {data.language}</span>}
            <span>🌿 {data.default_branch}</span>
            <span>
              ⏱ 업데이트: {new Date(data.updated_at).toLocaleString()}
            </span>
          </div>

          {data.topics && data.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {data.topics.slice(0, 8).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            <a
              href={data.owner.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
              title={data.owner.login}
            >
              <img
                src={data.owner.avatar_url}
                alt={data.owner.login}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-700">@{data.owner.login}</span>
            </a>
            {data.homepage && (
              <a
                href={data.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 underline"
              >
                Homepage
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
