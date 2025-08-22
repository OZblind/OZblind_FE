import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GithubList from "@components/Board/github/GithubList";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { urlForPost } from "@src/utils/urlForPost";
import { useGithubPosts, useGithubListItems } from "@hooks/useGithubPosts";

/** 상세에서 링크만 가져오기 (타입가드 포함) */
type GithubDetailResponse = { post_id?: number | string; link?: string };
function isGithubDetailResponse(v: unknown): v is GithubDetailResponse {
  return typeof v === "object" && v !== null;
}
async function fetchGithubLinkById(postId: string): Promise<string> {
  const res = await fetch(`/api/posts/github/${postId}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("레포 링크 조회 실패");
  const json: unknown = await res.json();
  if (!isGithubDetailResponse(json) || typeof json.link !== "string") return "";
  return json.link;
}

export default function GithubListPage() {
  const nav = useNavigate();

  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    refetch,
  } = useGithubPosts();
  const rawItems = useGithubListItems(data);

  /** 링크 캐시/가드 */
  const [repoLinkMap, setRepoLinkMap] = useState<Record<string, string>>({});
  const mountedRef = useRef(true);
  const busySetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 새로 추가된 아이템 중에서 repoLink 없는 것들만 상세로 보강
  useEffect(() => {
    const targets = rawItems
      .filter(
        (it) =>
          !it.repoLink && !repoLinkMap[it.id] && !busySetRef.current.has(it.id)
      )
      .map((it) => it.id);

    if (targets.length === 0) return;
    targets.forEach((id) => busySetRef.current.add(id));

    (async () => {
      try {
        const results = await Promise.all(
          targets.map(async (id) => {
            try {
              const link = await fetchGithubLinkById(id);
              return { id, link };
            } catch {
              return { id, link: "" };
            }
          })
        );
        if (!mountedRef.current) return;
        setRepoLinkMap((prev) => {
          const next = { ...prev };
          for (const { id, link } of results) if (link) next[id] = link;
          return next;
        });
      } finally {
        targets.forEach((id) => busySetRef.current.delete(id));
      }
    })();
  }, [rawItems, repoLinkMap]);

  // 화면 전달용: repoLink 보강
  const items = useMemo(
    () =>
      rawItems.map((it) => ({
        ...it,
        repoLink: it.repoLink || repoLinkMap[it.id] || "",
      })),
    [rawItems, repoLinkMap]
  );

  // 로딩/센티넬
  const isInitialLoading = items.length === 0 && !!isFetching;
  const listIsLoading = isInitialLoading || isFetchingNextPage;

  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "400px 0px",
    threshold: 0,
    disabled: listIsLoading || !hasNextPage || isError,
    onIntersect: async () => {
      await fetchNextPage();
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    },
  });

  const handleRefresh = useCallback(() => {
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    refetch();
  }, [refetch]);

  const errorText = useMemo(() => {
    if (!isError) return undefined;
    if (error && typeof error === "object" && "message" in error) {
      return (error as { message?: string }).message;
    }
    return "GitHub 게시판 목록을 불러오는 중 문제가 발생했습니다.";
  }, [isError, error]);

  /** 레포 링크 클릭: 캐시 우선, 없으면 on-demand 조회 후 오픈 */
  const handleRepoClick = useCallback(
    async (id: string) => {
      const cached = repoLinkMap[id];
      if (cached) {
        window.open(cached, "_blank", "noopener,noreferrer");
        return;
      }
      try {
        const link = await fetchGithubLinkById(id);
        if (!link) return;
        if (mountedRef.current)
          setRepoLinkMap((prev) => ({ ...prev, [id]: link }));
        window.open(link, "_blank", "noopener,noreferrer");
      } catch {
        // TODO[UX]: 토스트로 "레포 링크를 가져올 수 없습니다" 등 노출
      }
    },
    [repoLinkMap]
  );

  return (
    <div className="self-stretch w-[800px] max-w-full p-4">
      <section className="w-full rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-hidden">
        <GithubList
          items={items}
          onItemClick={(id) => nav(urlForPost.postDetail("github", id))}
          onRepoClick={handleRepoClick}
          topBar={{
            boardName: "GitHub 게시판",
            onOpenSort: () => {}, // TODO[SORT]: 훅 파라미터 연결
            onOpenTag: () => {}, // TODO[TAGS]: 필터 파라미터 연결
            onWrite: () => nav(urlForPost.postCreate("github")),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={listIsLoading}
          isError={isError}
          errorText={errorText}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl}
          emptyText="등록된 GitHub 게시글이 없습니다."
          className="py-2"
        />
      </section>
    </div>
  );
}
