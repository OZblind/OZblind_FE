export type Source = "remoteok" | "arbeitnow" | "ashby";

export type JobCard = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  url: string;
  logo?: string;
  publishedAt?: string;
  remote?: boolean;
};
