/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import type { CommentMeta } from "@src/types/post";
import { commentTree } from "@src/utils/commentTree";
import {
  listCommentsByPost,
  createRootComment, // 루트 댓글
  createReply, // 대댓글
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
} from "@api/comments";
import { useToastStore } from "@src/store/toastStore";

type SortKey = "newest" | "oldest" | "likes";

export function useComments(postId: string | number) {
  const [items, setItems] = useState<CommentMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const toast = useToastStore(); // toast.push 사용

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listCommentsByPost(postId); // API만 사용
        setItems(data);
      } catch {
        toast.push({ message: "댓글을 불러오지 못했어요.", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, toast]);

  const sorted = useMemo(() => {
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

  // 수정 (낙관적 업데이트 + 실패 시 롤백)
  const onEdit = async (id: CommentMeta["id"], content: string) => {
    const prev = items;
    setItems((curr) =>
      commentTree.update(curr, id, (c) => ({ ...c, content }))
    );
    try {
      await apiUpdateComment(id, content);
    } catch {
      setItems(prev);
      toast.push({ message: "수정 실패", type: "error" });
    }
  };

  // 삭제 (낙관적 제거 + 실패 시 롤백)
  const onDelete = async (id: CommentMeta["id"]) => {
    const prev = items;
    setItems((curr) => commentTree.remove(curr, id));
    try {
      await apiDeleteComment(id);
    } catch {
      setItems(prev);
      toast.push({ message: "삭제 실패", type: "error" });
    }
  };

  /** 댓글 작성
   * - 루트 댓글: rootId 없이 → createRootComment(postId, content)
   * - 대댓글: rootId 포함 → createReply({ postId, rootId, content })
   * 반환이 없는 구현이어도 문제없게: 응답이 없으면 최신 목록 재조회로 동기화
   */
  const onAddReply = async (
    rootId: CommentMeta["id"] | undefined,
    content: string
  ) => {
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
    setItems((curr) =>
      rootId
        ? commentTree.addToRoot(curr, String(rootId), optimistic)
        : [optimistic, ...curr]
    );

    try {
      // 중앙 API로 분기
      const resp: any = rootId
        ? await createReply({ postId, rootId, content })
        : await createRootComment(postId, content);

      // API가 CommentMeta를 반환하면 temp → real 교체
      if (resp && typeof resp === "object" && resp.id) {
        setItems((curr) =>
          commentTree.update(curr, tempId, () => resp as CommentMeta)
        );
      } else {
        // 반환이 없으면 최신 목록을 다시 당겨서 확정 동기화
        const latest = await listCommentsByPost(postId);
        setItems(latest);
      }
    } catch {
      setItems(prev);
      toast.push({ message: "등록 실패", type: "error" });
    }
  };

  return {
    items: sorted,
    rawItems: items,
    loading,
    sortKey,
    setSortKey,
    onEdit,
    onDelete,
    onAddReply,
  };
}
