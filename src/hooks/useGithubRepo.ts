import { useEffect, useState } from "react";
import { parseGithubRepo } from "@utils/parseGithub";

export interface GithubRepo {
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  license: { spdx_id: string | null } | null;
  language: string | null;
  topics?: string[];
  owner: { login: string; avatar_url: string; html_url: string };
  default_branch: string;
  updated_at: string;
  homepage: string | null;
}

export function useGithubRepo(repoUrl: string) {
  const [data, setData] = useState<GithubRepo | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setErr(null);
    if (!repoUrl) return;

    const parsed = parseGithubRepo(repoUrl);
    if (!parsed) {
      setErr("유효한 GitHub 레포 URL이 아닙니다.");
      return;
    }

    const controller = new AbortController();
    const { owner, repo } = parsed;

    async function fetchRepo() {
      try {
        setLoading(true);
        // 토픽까지 받으려면 Accept 헤더 필요
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
            },
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          if (res.status === 404)
            throw new Error("레포지토리를 찾을 수 없습니다.");
          throw new Error(`GitHub API 오류 (${res.status})`);
        }
        const json = await res.json();

        // topics는 별도 엔드포인트이거나, GraphQL/헤더 필요.
        const topicsRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/topics`,
          {
            headers: {
              Accept: "application/vnd.github.mercy-preview+json",
            },
            signal: controller.signal,
          }
        );
        const topicsJson = topicsRes.ok
          ? await topicsRes.json()
          : { names: [] };

        setData({ ...json, topics: topicsJson.names || [] });
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.name !== "AbortError") setErr(e.message);
        } else {
          setErr("불러오기 실패");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRepo();
    return () => controller.abort();
  }, [repoUrl]);

  return { data, loading, error: err };
}
