import { hotPosts } from "./data";
import HotPostCard from "./HotPostCard";

export default function HotBoard() {
  return (
    <div>
      <p className="py-2  text-base-content/50">Hot 게시판</p>
      <div className="flex gap-2 w-[800px] h-[200px]">
        {hotPosts.map((post) => (
          <HotPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
