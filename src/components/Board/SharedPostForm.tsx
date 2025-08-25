/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import ToastEditor from "@components/Board/editor/ToastEditor";
import { Button } from "@components/ui/Button";
import type { BoardSlug } from "@src/constants/boards";
import { createPost, updatePost } from "@src/api/posts";
import { useToastStore } from "@src/store/toastStore";
import { useNavigate } from "react-router-dom";

interface Props {
  /** "free" | "job" | "info" (기존 문자열도 호환) */
  board: BoardSlug | string;
  /** 기본값: "create" */
  mode?: "create" | "edit";
  /** mode="edit"일 때 필요한 대상 글 ID */
  postId?: number;
  /** 수정 모드에서 초기값 */
  initial?: {
    title?: string;
    content?: string;
  };
  onCancel: () => void;
  /** 저장 성공 후 콜백(선택) */
  onSubmitted?: (id?: number) => void;
}

export default function SharedPostForm({
  board,
  mode = "create",
  postId,
  initial,
  onCancel,
  onSubmitted,
}: Props) {
  const isEdit = mode === "edit";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // initial 값이 변경될 수 있는 경우(예: 상세 로드 후 주입) 반영
  useEffect(() => {
    if (typeof initial?.title === "string") setTitle(initial.title);
    if (typeof initial?.content === "string") setContent(initial.content);
  }, [initial?.title, initial?.content]);

  const handleSubmit = async () => {
    const nextTitle = title.trim();
    const nextContent = content ?? "";

    if (!nextTitle || !nextContent.trim()) {
      useToastStore.getState().push({
        message: "제목/내용을 입력하세요.",
        type: "warning",
        durationMs: 2500,
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        if (!postId) {
          useToastStore.getState().push({
            message: "수정 대상 글 ID가 없습니다.",
            type: "error",
            durationMs: 3000,
          });
          return;
        }
        await updatePost({
          id: postId,
          title: nextTitle,
          content: nextContent,
        });

        useToastStore.getState().push({
          message: "게시글이 수정되었습니다.",
          type: "success",
          durationMs: 3000,
        });

        onSubmitted?.(postId);
        requestAnimationFrame(() => navigate(`/posts/${postId}`));
      } else {
        const res = await createPost({
          board: board as BoardSlug,
          title: nextTitle,
          content: nextContent,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newId = (res as any)?.id ?? (res as any)?.post_id; // 백 규약 이중 대비
        useToastStore.getState().push({
          message: "게시글이 등록되었습니다.",
          type: "success",
          durationMs: 3000,
        });

        if (newId) {
          onSubmitted?.(newId);
          requestAnimationFrame(() => navigate(`/posts/${newId}`));
        } else {
          onSubmitted?.();
          onCancel(); // id가 없다면 이전 화면으로
        }
      }
    } catch (e: any) {
      useToastStore.getState().push({
        message:
          e?.message ??
          (isEdit
            ? "게시글 수정에 실패했습니다."
            : "게시글 등록에 실패했습니다."),
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
        <ToastEditor
          // ToastEditor가 초기값 prop을 지원하면 활성화
          // @ts-expect-error 구현에 따라 initialValue prop 존재
          initialValue={content}
          onChange={setContent}
          // initial이 바뀌면 에디터 리마운트하여 초기값 반영
          key={`${isEdit ? postId : "create"}:${initial?.title ?? ""}:${
            initial?.content ?? ""
          }`}
        />
      </div>

      <div className="flex justify-end gap-4 mt-2">
        <Button
          variant="secondary"
          className="min-w-[100px]"
          onClick={onCancel}
          disabled={submitting}
        >
          취소
        </Button>
        <Button
          variant="primary"
          className="min-w-[100px]"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? isEdit
              ? "수정 중..."
              : "작성 중..."
            : isEdit
            ? "수정"
            : "작성"}
        </Button>
      </div>
    </div>
  );
}
