import { PostList, type FreeBoardItem } from "@src/components/Board/free";
import HotBoard from "@src/components/HotBoard/HotBoard";
import JobBannerTabs from "@src/components/JobBanner/JobBannerTabs";
import { useInfiniteScroll } from "@src/hooks/useInfiniteScroll";
import { formatYyMmDd, formatYyyyMmDdHms } from "@src/utils/date";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLatestPosts } from "../../api/latestPost";
import type { Post } from "../../types/latestPost";
import { LIST_SETTINGS } from "@src/constants/ui";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FreeBoardItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<string>(
    formatYyyyMmDdHms(new Date())
  );
  const [page, setPage] = useState(1); // 현재 페이지

  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const hasMoreRef = useRef(true);

  const loadLatestPosts = useCallback(async (pageToLoad: number) => {
    if (busyRef.current || !hasMoreRef.current) return;
    busyRef.current = true;
    if (mountedRef.current) setBusy(true);
    setErr(null);

    try {
      const posts: Post[] = await getLatestPosts(pageToLoad);
      if (!mountedRef.current) return;

      const newItems: FreeBoardItem[] = posts.map((post) => ({
        id: post.id,
        no: post.id,
        title: post.title,
        author:
          post.user && typeof post.user === "object"
            ? `${post.user.tag_class} ${post.user.tag_number}기`
            : "익명",
        dateText: formatYyMmDd(new Date(post.created_at)),
        views: post.view_count,
        likes: post.like_count,
      }));

      setItems((prev) => [...prev, ...newItems]);
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));

      // 페이지네이션 체크
      if (posts.length < LIST_SETTINGS.ITEMS_PER_PAGE) {
        hasMoreRef.current = false; // 더 이상 불러올 페이지 없음
      } else {
        setPage((prev) => prev + 1); // 다음 페이지
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr(String(e));
      }
    } finally {
      if (mountedRef.current) setBusy(false);
      busyRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadLatestPosts(1); // 첫 페이지 로드
    return () => {
      mountedRef.current = false;
    };
  }, [loadLatestPosts]);

  const { sentinelRef } = useInfiniteScroll({
    root: null,
    rootMargin: "1000px 0px",
    threshold: 0,
    disabled: busy || !!err || !hasMoreRef.current,
    onIntersect: () => loadLatestPosts(page),
  });

  const handleRefresh = () => {
    setItems([]);
    setPage(1);
    hasMoreRef.current = true;
    loadLatestPosts(1);
  };

  return (
    <main className="flex flex-col gap-2">
      <JobBannerTabs />
      <HotBoard />
      <div className="w-[800px] pb-8">
        <p className="py-2 text-base-content/50">최신글</p>
        <div className="border border-base-300 py-2 rounded-md min-h-[240px] h-[calc(100vh-600px)] overflow-hidden">
          <PostList
            items={items}
            onItemClick={(id) => navigate(`/posts/${id}`)}
            lastLoadedAt={lastLoadedAt}
            onRefresh={handleRefresh}
            isLoading={busy}
            isError={!!err}
            errorText={err ?? undefined}
            hasMore={hasMoreRef.current}
            sentinelRef={sentinelRef}
            empty={{
              message: "조건에 맞는 게시글이 없습니다.",
              actionLabel: "새로고침",
              onAction: handleRefresh,
            }}
          />
        </div>
      </div>
    </main>
  );
}
