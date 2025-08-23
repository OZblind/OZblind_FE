import { useEffect, useState, useCallback } from "react";
import type { CommentFull } from "@src/types/comment";
import {
  fetchCommentsByPost,
  createRootComment,
  createReplyComment,
  updateComment,
  deleteComment,
} from "@src/api/comments";
import { groupByThread, type CommentThread } from "@src/utils/comments";

export function useComments(postId: number) {
  const [raw, setRaw] = useState<CommentFull[]>([]);
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchCommentsByPost(postId);
      setRaw(list);
      setThreads(groupByThread(list));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? "댓글 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // 생성(루트/대댓글)
  const addRoot = useCallback(
    async (content: string) => {
      const created = await createRootComment(postId, content);
      // 생성 응답이 축약형이므로 전체 목록 재조회 권장
      await reload();
      return created;
    },
    [postId, reload]
  );

  const addReply = useCallback(
    async (rootId: number, content: string) => {
      const created = await createReplyComment(postId, rootId, content);
      await reload();
      return created;
    },
    [postId, reload]
  );

  const edit = useCallback(
    async (id: number, content: string) => {
      await updateComment(id, content);
      await reload(); // 응답이 message 뿐이므로 재조회
    },
    [reload]
  );

  const remove = useCallback(
    async (id: number) => {
      const status = await deleteComment(id);
      // 200(소프트)든 204(하드)든 최신 상태 반영을 위해 재조회
      await reload();
      return status;
    },
    [reload]
  );

  return {
    loading,
    error,
    threads,
    raw,
    reload,
    addRoot,
    addReply,
    edit,
    remove,
  };
}
