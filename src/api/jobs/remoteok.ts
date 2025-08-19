import type { JobCard } from "@src/types/job";

type RemoteOKResponse = Array<{
  id: number | string;
  position?: string;
  title?: string;
  company?: string;
  location?: string;
  url?: string;
  apply_url?: string;
  company_url?: string;
  logo?: string;
  company_logo?: string;
  date?: string;
  created?: string;
}>;

export async function fetchRemoteOK(): Promise<JobCard[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { Accept: "application/json" },
  });
  const json: RemoteOKResponse = await res.json();
  const items = Array.isArray(json)
    ? json.filter((x) => x && x.id && (x.position || x.title))
    : [];
  return items.map((j) => ({
    id: String(j.id),
    title: j.position ?? j.title ?? "Untitled",
    company: j.company,
    location: j.location,
    url: j.url ?? j.apply_url ?? j.company_url ?? "#",
    logo: j.logo ?? j.company_logo,
    publishedAt: j.date ?? j.created,
    remote: true,
  }));
}
