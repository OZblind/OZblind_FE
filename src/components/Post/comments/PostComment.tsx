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
  normalizeDate,
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
      created_at: string | number;
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

  const createdAt = normalizeDate(
    (c as any).createdAt ?? (c as any).created_at
  );

  const repliesArr = Array.isArray((c as any).replies)
    ? (c as any).replies
    : Array.isArray((c as any).thread_comments)
    ? (c as any).thread_comments
    : [];

  return {
    ...(c as CommentMeta),
    createdAt,
    viewerReaction,
    reactions,
    liked: viewerReaction === "like",
    disliked: viewerReaction === "dislike",
    likes: reactions.like,
    dislikes: reactions.dislike,
    replies: Array.isArray(c.replies)
      ? (c.replies.map(normalizeComment) as CommentNode[])
      : [],
    hasReplies: repliesArr.length > 0,
  };
}
const normalizeTree = (arr: any[]): CommentNode[] => arr.map(normalizeComment);

/* ------------------------------ *
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

/* ------------------------------ *
 * Memoized CommentItem Wrapper
 * ------------------------------ */

const MemoCommentItem = memo(
  CommentItem,
  (prev, next) =>
    prev.data === next.data &&
    prev.depth === next.depth &&
    prev.rootId === next.rootId &&
    prev.branchStyle === next.branchStyle &&
    prev.submittingRootId === next.submittingRootId &&
    prev.loading === next.loading &&
    prev.mineIds === next.mineIds // Set 참조 동일성으로 메모
);

/* ------------------------------ *
 * ThreadRow
 * ------------------------------ */
type ThreadRowProps = {
  c: CommentNode;
  submittingRootId: string | null;
  loading: boolean;
  mineIds: Set<string>; // 내가 소유한 댓글 id 모음
  onEdit: (id: CommentMeta["id"], content: string) => void;
  onDelete: (id: CommentMeta["id"]) => void;
  onAddReply: (rootId: CommentMeta["id"], content: string) => void;
};
const ThreadRow = memo(function ThreadRow({
  c,
  submittingRootId,
  loading,
  mineIds,
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
        mineIds={mineIds}
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
type Props = { postId: string | number; initialItems?: any[] };

export default function PostComment({ postId, initialItems }: Props) {
  const [items, setItems] = useState<CommentNode[]>([]);
  const itemsRef = useRef(items);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [submittingId, setSubmittingId] = useState<string | null>(null); // "top" | rootId | null
  const [mineIds, setMineIds] = useState<Set<string>>(new Set()); // 추가
  const toast = useToastStore();
  const bootstrapped = useRef(false);
  // ref에 최신 state 유지 (콜백에서 사용)
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 초기 아이템을 우선 적용. 없을 때만 서버 호출
  useEffect(() => {
    // 포스트 바뀔 때마다 한 번만
    bootstrapped.current = false;
    setItems([]); // 초기화
    setMineIds(new Set()); // (이전 답변에서 추가했던 mineIds 유지한다면)
  }, [postId]);

  useEffect(() => {
    if (bootstrapped.current) return;

    if (initialItems && initialItems.length > 0) {
      setItems(normalizeTree(initialItems)); // 서버 응답 그대로 반영
      bootstrapped.current = true;
      return;
    }

    // 초기 아이템 없으면 그때만 상세/댓글 로딩
    (async () => {
      try {
        setLoading(true);
        const data = await listCommentsByPost(postId); // ← 이 호출이 상세를 다시 부를 수 있음
        setItems(normalizeTree(data));
      } catch {
        toast.push({ message: "댓글을 불러오지 못했어요.", type: "error" });
      } finally {
        setLoading(false);
        bootstrapped.current = true;
      }
    })();
  }, [postId, initialItems, toast]);

  // 루트 댓글 즉시 반영 + 소유권 부여
  useEffect(() => {
    const onRootAdded = (e: Event) => {
      const ce = e as CustomEvent<{
        postId: string | number;
        content?: string;
        comment?: CommentMeta;
      }>;
      if (!ce?.detail) return;
      const { postId: pid, content, comment } = ce.detail;
      if (String(pid) !== String(postId)) return;

      let node: CommentNode;
      if (comment) {
        node = normalizeComment(comment);
        setMineIds((prev) => {
          const ns = new Set(prev);
          ns.add(String(node.id));
          return ns;
        });
      } else {
        node = normalizeComment({
          id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          author: "나",
          authorId: "me",
          authorName: "나",
          content: content ?? "",
          createdAt: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          liked: false,
          disliked: false,
          hasReplies: false,
          replies: [],
        } as CommentMeta);
        setMineIds((prev) => {
          const ns = new Set(prev);
          ns.add(String(node.id));
          return ns;
        });
      }

      setItems((curr) => [node, ...curr]);
    };

    window.addEventListener("comment:root-added", onRootAdded as EventListener);
    return () => {
      window.removeEventListener(
        "comment:root-added",
        onRootAdded as EventListener
      );
    };
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
      setItems(
        (curr) =>
          commentTree.update(curr, id, (c) => ({
            ...c,
            content,
          })) as CommentNode[]
      );
      try {
        await updateComment(id, content);
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
      } catch {
        setItems(prev);
        toast.push({ message: "삭제 실패", type: "error" });
      }
    },
    [toast]
  );

  /** 대댓글 작성 (※ 루트 댓글 작성은 PostDetail의 상단 입력이 담당) */
  /** 낙관적 추가 → 성공 시 실제 객체로 교체하고 소유권 부여 */
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
        const created = await createReply({ postId, rootId, content });
        const real = normalizeComment(created);

        // 임시(tempId) → 실제(real) 치환
        setItems((curr) => {
          const walk = (arr: CommentNode[]): any[] =>
            arr.map((n) => {
              if (String(n.id) === String(rootId)) {
                const replies = (n.replies ?? []).map((r) =>
                  String(r.id) === String(tempId) ? real : r
                );
                return { ...n, replies, hasReplies: replies.length > 0 };
              }
              return n.replies?.length ? { ...n, replies: walk(n.replies) } : n;
            });
          return walk(curr);
        });

        // 방금 만든 대댓글도 바로 내 소유로 표시
        setMineIds((prev) => {
          const ns = new Set(prev);
          ns.add(String(real.id));
          return ns;
        });
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

      {/* 스레드 렌더 */}
      <div className="space-y-8">
        {sortedTopLevel.map((c) => (
          <ThreadRow
            key={c.id}
            c={c}
            submittingRootId={submittingId}
            loading={loading}
            mineIds={mineIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddReply={handleAddReply}
          />
        ))}
      </div>
    </section>
  );
}
