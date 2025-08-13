export function parseGithubRepo(
  url: string
): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com") return null;
    // /owner/repo(/...optional)
    const [owner, repo] = u.pathname.replace(/^\/+/, "").split("/");
    if (!owner || !repo) return null;
    // `tree/branch`나 `blob/main` 뒤는 무시
    return { owner, repo };
  } catch {
    return null;
  }
}
