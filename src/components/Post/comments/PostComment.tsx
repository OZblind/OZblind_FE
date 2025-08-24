/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { fmtNum } from "@src/utils/utils";
import CommentItem from "./CommentItem";
import { commentTree } from "@src/utils/commentTree";
import type { CommentMeta } from "@src/types/post";
import { THREAD_COLOR_CLASSES } from "@src/constants/threadColors";
import { useToastStore } from "@src/store/toastStore";
import "./thread.css";

// 중앙 API 모듈에서만 사용
import {
  listCommentsByPost,
  createReply,
  updateComment,
  deleteComment,
} from "@api/comments";

type SortKey = "newest" | "oldest" | "likes";

function hashId(id: string | number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function classFor(id: string | number) {
  return THREAD_COLOR_CLASSES[hashId(id) % THREAD_COLOR_CLASSES.length];
}

export default function PostComment({ postId }: { postId: string | number }) {
  const [items, setItems] = useState<CommentMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [submittingId, setSubmittingId] = useState<string | null>(null); // "top" | rootId | null
  const toast = useToastStore();

  // 공통 재조회
  const refresh = useRef<() => Promise<void>>(async () => {
    try {
      setLoading(true);
      const data = await listCommentsByPost(postId); // 중앙 API
      setItems(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.push({ message: "댓글을 불러오지 못했어요.", type: "error" });
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    refresh.current();
  }, [postId]);

  const sortedTopLevel = useMemo(() => {
    const arr = [...items];
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
  }, [items, sortKey]);

  // 수정
  const handleEdit = async (id: CommentMeta["id"], content: string) => {
    const prev = items;
    setItems((curr) =>
      commentTree.update(curr, id, (c) => ({ ...c, content }))
    );
    try {
      await updateComment(id, content);
      await refresh.current();
    } catch {
      setItems(prev);
      toast.push({ message: "수정 실패", type: "error" });
    }
  };

  // 삭제
  const handleDelete = async (id: CommentMeta["id"]) => {
    const prev = items;
    setItems((curr) => commentTree.remove(curr, id));
    try {
      await deleteComment(id);
      await refresh.current();
    } catch {
      setItems(prev);
      toast.push({ message: "삭제 실패", type: "error" });
    }
  };

  /** 대댓글 작성 (※ 루트 댓글 작성은 PostDetail의 상단 입력이 담당) */
  const handleAddReply = async (rootId: CommentMeta["id"], content: string) => {
    const tempId = `temp_${Date.now()}`;
    const optimistic: CommentMeta = {
      id: tempId,
      author: "나",
      authorId: "me",
      authorName: "나",
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false,
      hasReplies: false,
      replies: [],
    };

    const prev = items;
    setSubmittingId(String(rootId));
    setItems((curr) => commentTree.addToRoot(curr, String(rootId), optimistic));

    try {
      await createReply({ postId, rootId, content });
      await refresh.current(); // 최종 동기화
    } catch (e: any) {
      setItems(prev);
      if (e?.response?.status === 401) {
        toast.push({ message: "로그인이 필요합니다.", type: "warning" });
      } else if (e?.response?.status === 403) {
        toast.push({ message: "권한이 없습니다.", type: "warning" });
      } else {
        toast.push({ message: "등록 실패", type: "error" });
      }
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className="mt-8">
      {/* 헤더/정렬 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          댓글 {fmtNum(items.length)} {loading ? "· 불러오는 중…" : ""}
        </h2>
        <div className="flex items-center gap-2">
          <select
            id="comment-sort"
            className="select select-sm select-bordered"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="댓글 정렬"
            disabled={loading}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>
      </div>

      {/* 여기서는 루트 입력창을 두지 않습니다. (상단 입력은 PostDetail에만 존재) */}

      {/* 스레드 렌더 */}
      <div className="space-y-8">
        {sortedTopLevel.map((c) => {
          const branchStyle = classFor(c.id);
          return (
            <div key={c.id} className="relative pl-6 thread">
              {/* 스레드 레일/노드 데코 */}
              <span
                aria-hidden="true"
                className={`absolute left-[-2px] top-0 bottom-0 w-[4px] rounded-full opacity-70 thread-rail ${branchStyle.bg}`}
              />
              <span
                aria-hidden="true"
                className={`absolute left-0 -translate-x-1/2 thread-node rounded-full border-2 border-base-100 shadow ${branchStyle.bg}`}
              />

              <CommentItem
                data={c}
                depth={0}
                rootId={c.id}
                branchStyle={branchStyle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddReply={handleAddReply} // 대댓글만 이 경로로 작성
                submittingRootId={submittingId} // (선택) 해당 스레드만 잠금/로더
                loading={loading}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
