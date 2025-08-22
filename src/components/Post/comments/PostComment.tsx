import { useEffect, useMemo, useState } from "react";
import { fmtNum } from "@src/utils/utils";
import CommentItem from "./CommentItem";
import { commentTree } from "@src/utils/commentTree";
import "./thread.css";
import type { CommentMeta } from "@src/types/post";
import { THREAD_COLOR_CLASSES } from "@src/constants/threadColors";
import { fetchRandomNickname } from "@src/api/nickname";
import { useToastStore } from "@src/store/toastStore";

type SortKey = "newest" | "oldest" | "likes";

/** 스레드 색 팔레트: bg/stroke/fill 세트 (purge 방지용 상수) */

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

  // (선택) 공통 ID 생성 유틸
  const makeId = () => Math.random().toString(36).slice(2);

  const handleEdit = (id: CommentMeta["id"], content: string) => {
    setList((prev) => commentTree.update(prev, id, (c) => ({ ...c, content })));
  };

  const handleDelete = (id: CommentMeta["id"]) => {
    setList((prev) => commentTree.remove(prev, id));
  };

  const handleAddReply = async (rootId: CommentMeta["id"], content: string) => {
    const newId: CommentMeta["id"] = makeId(); // string ID
    try {
      const nickname = await fetchRandomNickname();

      const reply: CommentMeta = {
        id: newId,
        author: nickname, // 닉네임(간단 표기)
        authorId: "me", // 로그인 유저의 실제 ID로 대체하세요
        authorName: "현재 사용자", // 선택: 표시명
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
    } catch (err) {
      console.error(err);
      useToastStore.getState().push({
        message: "닉네임 생성에 실패했습니다.",
        type: "error",
        durationMs: 3000, // 선택 (기본값: 2500ms)
      });
    }
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
