import type { GithubListItem } from "@components/Board/github/GithubList";
import type { PostListItem } from "@api/posts";

type AnyObj = Record<string, unknown>;
function isObj(v: unknown): v is AnyObj {
  return typeof v === "object" && v !== null;
}
function pickString(o: unknown, key: string): string | undefined {
  if (!isObj(o)) return undefined;
  const v = o[key];
  return typeof v === "string" ? v : undefined;
}

/** PostListItem -> GithubListItem (link/태그는 가드 기반으로 안전 접근) */
export function mapToGithubListItem(src: PostListItem): GithubListItem {
  const title = (src as PostListItem).title ?? "(제목 없음)";

  const content = pickString(src, "content");
  const excerpt =
    pickString(src, "excerpt") ??
    (typeof content === "string"
      ? content.replace(/\s+/g, " ").slice(0, 80)
      : "");

  // 목록 응답에 link가 없을 수 있음(상세로 보강)
  const repoLink = pickString(src, "link") ?? "";

  return {
    id: String((src as PostListItem).id),
    title,
    excerpt,
    repoLink,
  };
}
