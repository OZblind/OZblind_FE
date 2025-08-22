import AssignedTagList from "@components/tags/AssignedTagList";
import type { GithubListItem } from "@components/Board/github/GithubList";
import type { PostListItem } from "@api/posts";
import { profileToTagsMock } from "@src/mocks/tags.mock";

type AnyObj = Record<string, unknown>;
function isObj(v: unknown): v is AnyObj {
  return typeof v === "object" && v !== null;
}
function pickString(o: unknown, key: string): string | undefined {
  if (!isObj(o)) return undefined;
  const v = o[key];
  return typeof v === "string" ? v : undefined;
}
function pickNestedString(
  o: unknown,
  path: readonly string[]
): string | undefined {
  let cur: unknown = o;
  for (const k of path) {
    if (!isObj(cur)) return undefined;
    cur = cur[k];
  }
  return typeof cur === "string" ? cur : undefined;
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

  // TODO: 작성자 태그: API 확정 전까지 안전 접근 + 목 태그
  const cohort = pickNestedString(src, ["user", "cohort"]) ?? "11기";
  const position = pickNestedString(src, ["user", "position"]) ?? "프론트";
  const tags = profileToTagsMock(
    cohort as Parameters<typeof profileToTagsMock>[0],
    position as Parameters<typeof profileToTagsMock>[1]
  );

  return {
    id: String((src as PostListItem).id),
    title,
    excerpt,
    repoLink,
    tagSlot: <AssignedTagList tags={tags} />,
  };
}
