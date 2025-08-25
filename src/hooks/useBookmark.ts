/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import { addBookmark, removeBookmark } from "@api/bookmarks";
import { useToastStore } from "@src/store/toastStore";

type UseBookmarkOptions = {
  postId: number;
  // 초기 상태(예: 서버에서 "이 글 북마크했는지"를 따로 내려주는 경우 주입)
  initial?: boolean;
  // 북마크 카운트를 화면에 같이 올리고/내리려면 연결용 콜백
  onCountChange?: (delta: 1 | -1) => void;
};

export function useBookmark({
  postId,
  initial = false,
  onCountChange,
}: UseBookmarkOptions) {
  const [bookmarked, setBookmarked] = useState<boolean>(initial);
  const [loading, setLoading] = useState(false);
  const toast = useToastStore();

  // 서버에서 받은 initial이 바뀌면 상태 동기화
  useEffect(() => {
    setBookmarked(!!initial);
  }, [initial]);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    if (!bookmarked) {
      // --- 추가(POST)
      setBookmarked(true);
      onCountChange?.(1);
      try {
        await addBookmark(postId);
        toast.push({ type: "success", message: "북마크 추가됨" });
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 400) {
          // 이미 존재 → 서버 상태는 true이므로 그대로 유지
          toast.push({ type: "info", message: "이미 북마크되어 있어요" });
          onCountChange?.(-1); // ★ 롤백
          setBookmarked(true);
        } else {
          // 그 외 에러 → 롤백
          setBookmarked(false);
          onCountChange?.(-1);
          toast.push({ type: "error", message: "북마크 추가 실패" });
        }
      } finally {
        setLoading(false);
      }
    } else {
      // --- 삭제(DELETE)
      setBookmarked(false);
      onCountChange?.(-1);
      try {
        await removeBookmark(postId);
        toast.push({ type: "success", message: "북마크 취소됨" });
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          // 이미 없음 → 서버 상태는 false이므로 그대로 유지
          onCountChange?.(1); // ★ 롤백
          setBookmarked(false);
          toast.push({ type: "info", message: "이미 취소된 상태예요" });
        } else {
          // 그 외 에러 → 롤백
          setBookmarked(true);
          onCountChange?.(1);
          toast.push({ type: "error", message: "북마크 취소 실패" });
        }
      } finally {
        setLoading(false);
      }
    }
  }, [bookmarked, loading, onCountChange, postId, toast]);

  return { bookmarked, loading, toggle, setBookmarked };
}
