import { useEffect, useMemo, useRef, useState } from "react";
import type { CommentMeta } from "@src/mocks/post.demo";
import { fmtNum } from "@src/utils/utils";
import CommentItem from "./CommentItem";
import { commentTree } from "@src/utils/commentTree";
import "./thread.css";

type SortKey = "newest" | "oldest" | "likes";

/** 스레드 색 팔레트: bg/stroke/fill 세트 (purge 방지용 상수) */
const THREAD_COLOR_CLASSES = [
  { bg: "bg-blue-500", stroke: "stroke-blue-500", fill: "fill-blue-500" },
  {
    bg: "bg-emerald-500",
    stroke: "stroke-emerald-500",
    fill: "fill-emerald-500",
  },
  { bg: "bg-amber-500", stroke: "stroke-amber-500", fill: "fill-amber-500" },
  { bg: "bg-red-500", stroke: "stroke-red-500", fill: "fill-red-500" },
  { bg: "bg-violet-500", stroke: "stroke-violet-500", fill: "fill-violet-500" },
  { bg: "bg-teal-500", stroke: "stroke-teal-500", fill: "fill-teal-500" },
  { bg: "bg-pink-500", stroke: "stroke-pink-500", fill: "fill-pink-500" },
  { bg: "bg-cyan-500", stroke: "stroke-cyan-500", fill: "fill-cyan-500" },
  {
    bg: "bg-fuchsia-500",
    stroke: "stroke-fuchsia-500",
    fill: "fill-fuchsia-500",
  },
  { bg: "bg-orange-500", stroke: "stroke-orange-500", fill: "fill-orange-500" },
  { bg: "bg-green-500", stroke: "stroke-green-500", fill: "fill-green-500" },
  { bg: "bg-sky-500", stroke: "stroke-sky-500", fill: "fill-sky-500" },
] as const;

function hashId(id: string | number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function classFor(id: CommentMeta["id"]) {
  return THREAD_COLOR_CLASSES[hashId(id) % THREAD_COLOR_CLASSES.length];
}

export default function PostComment({ comments }: { comments: CommentMeta[] }) {
  const [list, setList] = useState<CommentMeta[]>(comments);
  useEffect(() => setList(comments), [comments]);

  const idRef = useRef<number>(commentTree.getMaxNumericId(comments) || 0);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const topLevelSorted = useMemo(() => {
    const arr = [...list];
    switch (sortKey) {
      case "newest":
        arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "oldest":
        arr.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "likes":
        arr.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        break;
    }
    return arr;
  }, [list, sortKey]);

  const handleEdit = (id: CommentMeta["id"], content: string) => {
    setList((prev) => commentTree.update(prev, id, (c) => ({ ...c, content })));
  };
  const handleDelete = (id: CommentMeta["id"]) => {
    setList((prev) => commentTree.remove(prev, id));
  };
  const handleAddReply = (rootId: CommentMeta["id"], content: string) => {
    const newId =
      typeof rootId === "number" ? ++idRef.current : String(Date.now());
    const reply: CommentMeta = {
      id: newId as CommentMeta["id"],
      author: "나",
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false,
      hasReplies: false,
      replies: [],
    };
    setList((prev) => commentTree.addToRoot(prev, rootId, reply));
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">댓글 {fmtNum(list.length)}</h2>
        <div className="flex items-center gap-2">
          <select
            id="comment-sort"
            className="select select-sm select-bordered"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="댓글 정렬"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {topLevelSorted.map((c) => {
          const branchStyle = classFor(c.id);
          return (
            <div key={c.id} className="relative pl-6 thread">
              {/* 세로 브랜치 라인: 더 굵게 */}
              <span
                aria-hidden="true"
                className={`absolute left-[-2px] top-0 bottom-0 w-[4px] rounded-full opacity-70 thread-rail ${branchStyle.bg}`}
              />
              {/* 시작 노드(원): 세로 라인 시작점에 표시 */}
              <span
                aria-hidden="true"
                className={`
                  absolute left-0 -translate-x-1/2 thread-node
                rounded-full border-2 border-base-100 shadow
                ${branchStyle.bg}
                `}
              />
              <CommentItem
                data={c}
                depth={0}
                rootId={c.id}
                branchStyle={branchStyle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddReply={handleAddReply}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
