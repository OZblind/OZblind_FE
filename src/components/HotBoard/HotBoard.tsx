import { hotPosts } from "./data";
import HotPostCard from "./HotPostCard";

export default function HotBoard() {
  return (
    <div className="flex gap-2 w-[800px] h-[200px] py-2">
      {hotPosts.map((post) => (
        <HotPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
