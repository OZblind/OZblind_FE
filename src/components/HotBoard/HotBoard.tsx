import { useEffect, useState } from "react";
import type { HotPost } from "@src/types/hotPost";
import HotPostCard from "./HotPostCard";
import { fetchHotPosts, patchHotPosts } from "@api/hotPosts";

export default function HotBoard({ csrfToken }: { csrfToken: string }) {
  const [posts, setPosts] = useState<HotPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHotPosts() {
      try {
        setLoading(true);
        await patchHotPosts(csrfToken);

        const hotPosts = await fetchHotPosts(csrfToken);
        setPosts(hotPosts);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err)); // Error 객체가 아니면 문자열로 변환
        }
      } finally {
        setLoading(false);
      }
    }

    loadHotPosts();
  }, [csrfToken]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러 발생: {error}</p>;

  return (
    <div>
      <p className="py-2 text-base-content/50">Hot 게시판</p>
      <div className="flex gap-2 w-[800px] h-[160px] overflow-x-auto">
        {posts.map((post) => (
          <HotPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
