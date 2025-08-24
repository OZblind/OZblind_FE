/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// 댓글 + 리액션 필드가 포함된 명시 타입
type CommentNode = CommentMeta & {
  viewerReaction: "like" | "dislike" | null;
  reactions: { like: number; dislike: number };
  replies: CommentNode[]; // 재귀
  // (호환) 백엔드/기존 코드가 참고할 수도 있으니 동기화해 둠
  liked?: boolean;
  disliked?: boolean;
  likes?: number;
  dislikes?: number;
};

// 서버 필드 → UI 표준 필드로 정규화
function normalizeComment(
  c: CommentMeta &
    Partial<{
      viewerReaction: "like" | "dislike" | null;
      reactions: { like: number; dislike: number };
      liked: boolean;
      disliked: boolean;
      likes: number;
      dislikes: number;
      replies: any[];
    }>
): CommentNode {
  const viewerReaction =
    c.viewerReaction ?? (c.liked ? "like" : c.disliked ? "dislike" : null);
  const reactions = {
    like:
      (c.reactions?.like as number | undefined) ??
      (typeof c.likes === "number" ? c.likes : 0),
    dislike:
      (c.reactions?.dislike as number | undefined) ??
      (typeof c.dislikes === "number" ? c.dislikes : 0),
  };
  return {
    ...(c as CommentMeta),
    viewerReaction,
    reactions,
    liked: viewerReaction === "like",
    disliked: viewerReaction === "dislike",
    likes: reactions.like,
    dislikes: reactions.dislike,
    replies: Array.isArray(c.replies)
      ? (c.replies.map(normalizeComment) as CommentNode[])
      : [],
  };
}
const normalizeTree = (arr: any[]): CommentNode[] => arr.map(normalizeComment);

/* ------------------------------
 * utils
 * ------------------------------ */

function hashId(id: string | number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function classFor(id: string | number) {
  return THREAD_COLOR_CLASSES[hashId(id) % THREAD_COLOR_CLASSES.length];
}

/* ------------------------------
 * Memoized CommentItem Wrapper
 * - data, depth, rootId, branchStyle, submittingRootId, loading만 비교
 * ------------------------------ */

const MemoCommentItem = memo(
  CommentItem,
  (prev, next) =>
    prev.data === next.data &&
    prev.depth === next.depth &&
    prev.rootId === next.rootId &&
    prev.branchStyle === next.branchStyle &&
    prev.submittingRootId === next.submittingRootId &&
    prev.loading === next.loading
);

/* ------------------------------
 * ThreadRow: 루트 스레드 1개 렌더 (메모화)
 * ------------------------------ */
type ThreadRowProps = {
  c: CommentNode;
  submittingRootId: string | null;
  loading: boolean;
  onEdit: (id: CommentMeta["id"], content: string) => void;
  onDelete: (id: CommentMeta["id"]) => void;
  onAddReply: (rootId: CommentMeta["id"], content: string) => void;
};
const ThreadRow = memo(function ThreadRow({
  c,
  submittingRootId,
  loading,
  onEdit,
  onDelete,
  onAddReply,
}: ThreadRowProps) {
  const branchStyle = classFor(c.id); // 상수 테이블 참조 → 안정적
  return (
    <div className="relative pl-6 thread">
      {/* 스레드 레일/노드 데코 */}
      <span
        aria-hidden="true"
        className={`absolute left-[-2px] top-0 bottom-0 w-[4px] rounded-full opacity-70 thread-rail ${branchStyle.bg}`}
      />
      <span
        aria-hidden="true"
        className={`absolute left-0 -translate-x-1/2 thread-node rounded-full border-2 border-base-100 shadow ${branchStyle.bg}`}
      />
      <MemoCommentItem
        data={c}
        depth={0}
        rootId={c.id}
        branchStyle={branchStyle}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddReply={onAddReply}
        submittingRootId={submittingRootId}
        loading={loading}
      />
    </div>
  );
});

export default function PostComment({ postId }: { postId: string | number }) {
  const [items, setItems] = useState<CommentNode[]>([]);
  const itemsRef = useRef(items);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [submittingId, setSubmittingId] = useState<string | null>(null); // "top" | rootId | null
  const toast = useToastStore();

  // ref에 최신 state 유지 (콜백에서 사용)
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 공통 재조회
  const refresh = useRef<() => Promise<void>>(async () => {
    try {
      setLoading(true);
      const data = await listCommentsByPost(postId);
      setItems(normalizeTree(data));
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
        arr.sort((a, b) => (b.reactions.like ?? 0) - (a.reactions.like ?? 0));
        break;
    }
    return arr;
  }, [items, sortKey]);

  // 수정
  const handleEdit = useCallback(
    async (id: CommentMeta["id"], content: string) => {
      const prev = itemsRef.current;
      // 구조적 공유: 변경 경로만 새 객체
      setItems(
        (curr) =>
          commentTree.update(curr, id, (c) => ({
            ...c,
            content,
          })) as CommentNode[]
      );
      try {
        await updateComment(id, content);
        await refresh.current();
      } catch {
        setItems(prev);
        toast.push({ message: "수정 실패", type: "error" });
      }
    },
    [toast]
  );

  const handleDelete = useCallback(
    async (id: CommentMeta["id"]) => {
      const prev = itemsRef.current;
      setItems((curr) => commentTree.remove(curr, id) as CommentNode[]);
      try {
        await deleteComment(id);
        await refresh.current();
      } catch {
        setItems(prev);
        toast.push({ message: "삭제 실패", type: "error" });
      }
    },
    [toast]
  );

  /** 대댓글 작성 (※ 루트 댓글 작성은 PostDetail의 상단 입력이 담당) */
  /** 낙관적 추가 기능. 임시댓글. 즉각적 반응감 */
  const handleAddReply = useCallback(
    async (rootId: CommentMeta["id"], content: string) => {
      const tempId = `temp_${Date.now()}`;
      const optimistic: CommentNode = {
        id: tempId,
        author: "나",
        authorId: "me",
        authorName: "나",
        content,
        createdAt: new Date().toISOString(),
        viewerReaction: null,
        reactions: { like: 0, dislike: 0 },
        likes: 0,
        dislikes: 0,
        liked: false,
        disliked: false,
        hasReplies: false,
        replies: [],
      };

      const prev = itemsRef.current;
      setSubmittingId(String(rootId));
      setItems(
        (curr) =>
          commentTree.addToRoot(
            curr,
            String(rootId),
            optimistic
          ) as CommentNode[]
      );

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
    },
    [postId, toast]
  );

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
        {sortedTopLevel.map((c) => (
          <ThreadRow
            key={c.id}
            c={c}
            submittingRootId={submittingId}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddReply={handleAddReply}
          />
        ))}
      </div>
    </section>
  );
}
