import { useState } from "react";
import ToastEditor from "@components/Board/editor/ToastEditor";
import { Button } from "@components/ui/Button";
import type { BoardSlug } from "@src/constants/boards";
import { createPost } from "@src/api/posts";
import { useToastStore } from "@src/store/toastStore";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../commons/ConfirmModal/ConfirmModal";
// import { createPost } from "@/api/post";

interface Props {
  board: string; // "free" | "job" | "info"
  onCancel: () => void;
}

export default function SharedPostForm({ board, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      useToastStore.getState().push({
        message: "제목/내용을 입력하세요.",
        type: "warning",
        durationMs: 2500,
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createPost({
        board: board as BoardSlug,
        title,
        content,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newId = (res as any)?.id ?? (res as any)?.post_id; // 둘 중 하나만 내려오는 경우 대비
      if (newId) {
        useToastStore.getState().push({
          message: "게시글이 등록되었습니다.",
          type: "success",
          durationMs: 3000,
        });
        requestAnimationFrame(() => navigate(`/posts/${newId}`));
        return;
      }

      // 혹시 id가 없다면: 리스트 새로고침 or 폼 초기화
      useToastStore.getState().push({
        message: "게시글이 등록되었습니다.",
        type: "success",
        durationMs: 3000,
      });
      onCancel(); // 이전 화면으로
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      useToastStore.getState().push({
        message: e?.message ?? "게시글이 등록에 실패했습니다.",
        type: "error",
        durationMs: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <input
          id="title"
          type="text"
          className="w-full border border-gray-300 rounded p-2"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex-1">
        <ToastEditor onChange={setContent} />
      </div>

      <div className="flex justify-end gap-4 mt-2">
        <Button
          variant="secondary"
          className="min-w-[100px]"
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
        >
          취소
        </Button>
        <Button
          variant="primary"
          className="min-w-[100px] text-white"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "작성 중..." : "작성"}
        </Button>
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        title="게시글 작성을 취소하시겠어요?"
        description="지금까지 작성한 정보는 전부 삭제됩니다."
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          onCancel();
          setShowConfirm(false);
        }}
      />
    </div>
  );
}
