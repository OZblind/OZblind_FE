import { PostList, type FreeBoardItem } from "@src/components/Board/free";
import HotBoard from "@src/components/HotBoard/HotBoard";
import JobBannerTabs from "@src/components/JobBanner/JobBannerTabs";
import { formatYyMmDd, formatYyyyMmDdHms } from "@src/utils/date";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLatestPosts } from "../../api/latestPost";
import type { Post } from "../../types/latestPost";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FreeBoardItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<string>(
    formatYyyyMmDdHms(new Date())
  );

  const mountedRef = useRef(true);

  const loadLatestPosts = useCallback(async () => {
    if (mountedRef.current) setBusy(true);
    setErr(null);

    try {
      const posts: Post[] = await getLatestPosts(1);
      if (!mountedRef.current) return;

      const newItems: FreeBoardItem[] = posts.map((post) => ({
        id: post.id,
        no: post.id,
        title: post.title,
        author:
          post.user && typeof post.user === "object"
            ? post.user.tag_class === "FE"
              ? `프론트 ${post.user.tag_number}기`
              : post.user.tag_class === "BE"
              ? `백엔드 ${post.user.tag_number}기`
              : `${post.user.tag_class} ${post.user.tag_number}기`
            : "익명",
        dateText: formatYyMmDd(new Date(post.created_at)),
        views: post.view_count,
        likes: post.like_count,
      }));

      setItems(newItems);
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr(String(e));
      }
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadLatestPosts(); // 첫 로드 시 호출
    return () => {
      mountedRef.current = false;
    };
  }, [loadLatestPosts]);

  const handleRefresh = () => {
    loadLatestPosts();
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
