import type { JobCard } from "@src/types/job";

type AshbyJob = {
  id?: string;
  title: string;
  department?: string;
  location?: string;
  jobUrl?: string;
  applyUrl?: string;
  publishedAt?: string;
  isRemote?: boolean;
};

type AshbyResponse = {
  jobs: AshbyJob[];
};

export async function fetchAshby(boardName: string): Promise<JobCard[]> {
  const res = await fetch(
    `https://api.ashbyhq.com/posting-api/job-board/${boardName}?includeCompensation=false`
  );
  const json: AshbyResponse = await res.json();
  return (json.jobs ?? []).map((j, idx: number) => ({
    id: j.id ?? String(idx),
    title: j.title,
    company: j.department,
    location: j.location,
    url: j.jobUrl ?? j.applyUrl ?? "#",
    publishedAt: j.publishedAt,
    remote: j.isRemote,
  }));
}
