/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@components/ui/Button";
import ToastEditor from "@components/Board/editor/ToastEditor";
import { RepoPreviewCard } from "./RepoPreviewCard";
import { useNavigate } from "react-router-dom";
import { createGithubPost, editGithubPost } from "@src/api/posts.special";
import { updatePost } from "@src/api/posts";
import { useToastStore } from "@src/store/toastStore";

interface Props {
  /** 기본값: "create" */
  mode?: "create" | "edit";
  /** 수정 대상 글 ID (mode="edit"에서 필요) */
  postId?: number;
  /** 수정 초기값 */
  initial?: {
    title?: string;
    content?: string;
    repoUrl?: string; // 백엔드로는 repo_url로 전달
  };
  onCancel: () => void;
  /** 저장 성공 후 콜백 (선택) */
  onSubmitted?: (id?: number) => void;
}

export default function GitRepoPostForm({
  mode = "create",
  postId,
  initial,
  onCancel,
  onSubmitted,
}: Props) {
  const isEdit = mode === "edit";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [repoLink, setRepoLink] = useState(initial?.repoUrl ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToastStore();

  // initial이 동적으로 주입될 수 있으니 동기화
  useEffect(() => {
    if (typeof initial?.title === "string") setTitle(initial.title);
    if (typeof initial?.content === "string") setContent(initial.content);
    if (typeof initial?.repoUrl === "string") setRepoLink(initial.repoUrl);
  }, [initial?.title, initial?.content, initial?.repoUrl]);

  const isValidUrl = (v: string) => {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    const t = title.trim();
    const c = content ?? "";
    const r = repoLink.trim();

    if (isEdit) {
      if (!postId) {
        toast.push({
          message: "수정 대상 글 ID가 없습니다.",
          type: "error",
          durationMs: 3000,
        });
        return;
      }
      await editGithubPost(postId, { title: t, content: c, link: r });
      toast.push({
        message: "게시글이 수정되었습니다.",
        type: "success",
        durationMs: 3000,
      });
      onSubmitted?.(postId);
      requestAnimationFrame(() => navigate(`/posts/${postId}`));
      return;
    }
    if (!t) {
      toast.push({
        message: "제목을 입력하세요.",
        type: "warning",
        durationMs: 2500,
      });
      return;
    }
    if (!c.trim()) {
      toast.push({
        message: "내용을 입력하세요.",
        type: "warning",
        durationMs: 2500,
      });
      return;
    }
    if (!r) {
      toast.push({
        message: "레포지토리 주소를 입력하세요.",
        type: "warning",
        durationMs: 2500,
      });
      return;
    }
    if (!isValidUrl(r)) {
      toast.push({
        message: "유효한 URL 형식이 아닙니다.",
        type: "warning",
        durationMs: 2500,
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        if (!postId) {
          toast.push({
            message: "수정 대상 글 ID가 없습니다.",
            type: "error",
            durationMs: 3000,
          });
          return;
        }
        // 수정: 일반 posts PATCH 사용 (repo_url 포함)
        await updatePost({
          id: postId,
          title: t,
          content: c,
          repo_url: r || undefined,
        });

        toast.push({
          message: "게시글이 수정되었습니다.",
          type: "success",
          durationMs: 3000,
        });
        onSubmitted?.(postId);
        requestAnimationFrame(() => navigate(`/posts/${postId}`));
      } else {
        // 작성: 기존 특수 엔드포인트 사용
        const res = await createGithubPost({ title: t, content: c, link: r });
        const newId = (res as any)?.id ?? (res as any)?.post_id;
        toast.push({
          message: "깃허브 게시글이 등록되었습니다.",
          type: "success",
          durationMs: 3000,
        });

        if (newId) {
          onSubmitted?.(newId);
          requestAnimationFrame(() => navigate(`/posts/${newId}`));
        } else {
          onSubmitted?.();
          onCancel();
        }
      }
    } catch (e: any) {
      toast.push({
        message:
          e?.response?.data?.detail ||
          e?.message ||
          (isEdit ? "수정에 실패했습니다." : "등록에 실패했습니다."),
        type: "error",
        durationMs: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // URL 입력 변화
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepoLink(value);
    setError(value && !isValidUrl(value) ? "유효한 URL 형식이 아닙니다." : "");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 제목 */}
      <div>
        <input
          id="gitrepo-title"
          type="text"
          className="w-full border border-gray-300 rounded p-2"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 레포 링크 입력 */}
      <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
        <input
          id="gitrepo-link"
          type="url"
          className={`border rounded p-2 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Git Repo 주소를 입력해주세요. 예) https://github.com/yourrepourl/xxxx"
          value={repoLink}
          onChange={handleChange}
        />
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>

      {/* 레포 프리뷰 카드 */}
      {repoLink && isValidUrl(repoLink) && (
        <RepoPreviewCard repoLink={repoLink} />
      )}

      {/* 에디터 (이미지는 에디터 내부 업로더 사용) */}
      <div className="flex-1">
        <ToastEditor
          // @ts-expect-error 구현에 따라 initialValue 제공
          initialValue={content}
          onChange={setContent}
          key={`${isEdit ? postId : "create"}:${initial?.title ?? ""}:${
            initial?.content ?? ""
          }:${initial?.repoUrl ?? ""}`}
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 mt-2">
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
