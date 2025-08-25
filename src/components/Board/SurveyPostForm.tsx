/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@components/ui/Button";
import ToastEditor from "@components/Board/editor/ToastEditor";
import LinkPreviewCard from "./LinkPreviewCard";
import { createSurveyPost, editSurveyPost } from "@src/api/posts.special";
import { useNavigate } from "react-router-dom";
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
    formLink?: string;
    /** ISO 또는 YYYY-MM-DD 모두 허용 */
    endDate?: string;
  };
  onCancel: () => void;
  /** 저장 성공 후 콜백 (선택) */
  onSubmitted?: (id?: number) => void;
}

const PROVIDERS = [
  { value: "google", label: "구글 폼", url: "https://forms.google.com" },
  { value: "naver", label: "네이버 폼", url: "https://form.naver.com" },
  { value: "moaform", label: "모아폼", url: "https://moaform.com" },
];

export default function SurveyPostForm({
  mode = "create",
  postId,
  initial,
  onCancel,
  onSubmitted,
}: Props) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [editorInitial, setEditorInitial] = useState(initial?.content ?? "");
  const [formLink, setFormLink] = useState(initial?.formLink ?? "");
  const [endDate, setEndDate] = useState(toInputDate(initial?.endDate) ?? ""); // YYYY-MM-DD
  const [provider, setProvider] = useState<string>(""); // placeholder 상태
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToastStore();

  // initial이 나중에 주입되는 경우 동기화
  useEffect(() => {
    if (typeof initial?.title === "string") setTitle(initial.title);
    if (typeof initial?.content === "string") {
      setContent(initial.content);
      setEditorInitial(initial.content);
    }
    if (typeof initial?.formLink === "string") setFormLink(initial.formLink);
    if (typeof initial?.endDate === "string")
      setEndDate(toInputDate(initial.endDate));
  }, [initial?.title, initial?.content, initial?.formLink, initial?.endDate]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setProvider(next);
    const found = PROVIDERS.find((p) => p.value === next);
    if (found) {
      window.open(found.url, "_blank", "noopener,noreferrer");
      setTimeout(() => setProvider(""), 0);
    }
  };

  const handleSubmit = async () => {
    const t = title.trim();
    const c = content ?? "";
    const link = formLink.trim();
    const end = endDate?.trim();

    if (!t)
      return toast.push({
        message: "제목을 입력하세요.",
        type: "warning",
        durationMs: 2500,
      });
    if (!c.trim())
      return toast.push({
        message: "내용을 입력하세요.",
        type: "warning",
        durationMs: 2500,
      });
    if (!link)
      return toast.push({
        message: "작성한 설문 링크를 입력하세요.",
        type: "warning",
        durationMs: 2500,
      });
    if (!isValidUrl(link))
      return toast.push({
        message: "유효한 URL 형식이 아닙니다.",
        type: "warning",
        durationMs: 2500,
      });
    if (!end)
      return toast.push({
        message: "설문 종료일을 선택하세요.",
        type: "warning",
        durationMs: 2500,
      });

    // 종료일을 KST 하루 끝(23:59:59)으로 ISO 변환
    const end_date_iso = new Date(`${end}T23:59:59+09:00`).toISOString();

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
        // 수정: 일반 PATCH (form_link, end_date 포함)
        await editSurveyPost(postId, {
          title: t,
          content: c,
          link,
          end_date: end_date_iso,
        });

        toast.push({
          message: "설문 게시글이 수정되었습니다.",
          type: "success",
          durationMs: 3000,
        });
        onSubmitted?.(postId);
        requestAnimationFrame(() => navigate(`/posts/${postId}`));
      } else {
        // 🆕 작성: 특수 엔드포인트
        const res = await createSurveyPost({
          title: t,
          content: c,
          end_date: end_date_iso,
          link,
        });

        const newId = (res as any)?.id ?? (res as any)?.post_id;
        toast.push({
          message: "설문 게시글이 등록되었습니다.",
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

  // 링크 입력 변화 + 유효성 검사
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormLink(value);
    setError(value && !isValidUrl(value) ? "유효한 URL 형식이 아닙니다." : "");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 제목 */}
      <div>
        <input
          id="survey-title"
          type="text"
          className="w-full border border-gray-300 rounded p-2"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 설문지 작성 / 링크 / 마감일 */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1 shrink-0">
          <label className="font-semibold text-white">설문 생성</label>
          <select
            aria-label="설문 폼 선택"
            className="border border-gray-300 rounded p-2 bg-white shrink-0"
            value={provider}
            onChange={handleProviderChange}
          >
            <option value="" disabled>
              설문 폼 선택
            </option>
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* 설문 링크 입력 */}
        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <label htmlFor="survey-link" className="font-semibold text-white">
            설문 링크
          </label>
          <input
            id="survey-link"
            type="url"
            className={`border rounded p-2 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="예) https://forms.gle/xxxx"
            value={formLink}
            onChange={handleChange}
          />
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>

        {/* 설문 마감일 */}
        <div className="flex flex-col gap-1 shrink-0">
          <label htmlFor="survey-end" className="font-semibold text-white">
            마감일
          </label>
          <input
            id="survey-end"
            type="date"
            className="border border-gray-300 rounded p-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* 링크 미리보기 카드 */}
      <LinkPreviewCard
        url={formLink}
        title={title || "제목 없음"}
        endDate={endDate}
      />

      {/* 에디터 (이미지는 에디터 내부 업로더 사용) */}
      <div className="flex-1">
        <ToastEditor initial={editorInitial} onChange={setContent} />
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

/** YYYY-MM-DD 또는 ISO를 date input 값(YYYY-MM-DD)으로 정규화 */
function toInputDate(src?: string): string {
  if (!src) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(src)) return src;
  const d = new Date(src);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isValidUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
