import type { JobCard } from "@src/types/job";

type ArbeitnowJob = {
  slug?: string;
  id?: string;
  title: string;
  company_name?: string;
  company?: string;
  location?: string;
  url?: string;
  created_at?: string;
  published_on?: string;
  remote?: boolean;
};

type ArbeitnowResponse = {
  data: ArbeitnowJob[];
};

export async function fetchArbeitnow(): Promise<JobCard[]> {
  const res = await fetch(
    "https://www.arbeitnow.com/api/job-board-api?size=50"
  );
  const json: ArbeitnowResponse = await res.json();
  return (json?.data ?? []).map((j, idx: number) => ({
    id: j.slug ?? j.id ?? String(idx),
    title: j.title,
    company: j.company_name ?? j.company,
    location: j.location,
    url: j.url ?? "#",
    publishedAt: (j.created_at ?? j.published_on ?? "").toString(),
    remote: j.remote,
  }));
}
