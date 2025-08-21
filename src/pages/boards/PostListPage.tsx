// src/pages/PostListPage.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPosts, type PostListItem } from "@api/posts";
import type { BoardSlug } from "@src/constants/boards";
import { mapToFreeItem } from "@src/features/posts/list/adapters";
import { PostList } from "@src/components/Board/free";

const PAGE_SIZE = 20;

const BOARD_LABEL: Record<BoardSlug, string> = {
  free: "자유 게시판",
  info: "정보 게시판",
  jobs: "취업 게시판",
  survey: "설문 게시판",
  github: "GitHub 게시판",
};

export default function PostListPage({ board }: { board: BoardSlug }) {
  const nav = useNavigate();
  const [items, setItems] = useState<PostListItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // 처음 & 페이지가 바뀔 때 로드
  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const list = await fetchPosts({
          board,
          ordering: "-created_at",
          page,
          page_size: PAGE_SIZE,
        });
        if (!alive) return;
        setItems((prev) => (page === 1 ? list : [...prev, ...list]));
        setHasMore(list.length === PAGE_SIZE); // 다음 페이지 유무(간이)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [board, page]);

  // 무한 스크롤 센티넬
  const ioRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (el: HTMLDivElement | null) => {
      ioRef.current?.disconnect();
      if (!el) return;
      ioRef.current = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading && hasMore) {
          setPage((p) => p + 1);
        }
      });
      ioRef.current.observe(el);
    },
    [loading, hasMore]
  );

  const uiItems = useMemo(() => items.map(mapToFreeItem), [items]);

  return (
    <PostList
      items={uiItems}
      onItemClick={(id) => nav(`/posts/${id}`)}
      topBar={{
        boardName: BOARD_LABEL[board],
        onWrite: () => nav(`/write?board=${board}`),
      }}
      lastLoadedAt={new Date().toISOString()}
      onRefresh={() => setPage(1)}
      isLoading={loading}
      isError={!!err}
      errorText={err ?? undefined}
      hasMore={hasMore}
      sentinelRef={sentinelRef}
      className="py-2"
    />
  );
}
