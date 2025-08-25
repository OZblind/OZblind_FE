import { useState } from "react";
import { Button } from "@components/ui/Button";
import ToastEditor from "@components/Board/editor/ToastEditor";
import LinkPreviewCard from "./LinkPreviewCard";
import { createSurveyPost } from "@src/api/posts.special";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "@src/store/toastStore";
import ConfirmModal from "../commons/ConfirmModal/ConfirmModal";

interface Props {
  onCancel: () => void;
}

const PROVIDERS = [
  { value: "google", label: "구글 폼", url: "https://forms.google.com" },
  { value: "naver", label: "네이버 폼", url: "https://form.naver.com" },
  { value: "moaform", label: "모아폼", url: "https://moaform.com" },
];

export default function SurveyPostForm({ onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formLink, setFormLink] = useState("");
  const [endDate, setEndDate] = useState("");
  const [provider, setProvider] = useState<string>(""); // placeholder 상태
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToastStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setProvider(next);
    const found = PROVIDERS.find((p) => p.value === next);
    if (found) {
      // 선택 즉시 새 창 열기
      window.open(found.url, "_blank", "noopener,noreferrer");
      // 다시 placeholder로 되돌려 중복 선택 시도 가능하게
      setTimeout(() => setProvider(""), 0);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");
    if (!formLink.trim()) return alert("작성한 설문 링크를 입력하세요.");
    if (!endDate) return alert("설문 종료일을 선택하세요.");

    // Date → ISO (KST 기준 하루 끝으로 보낼 예시)
    const end_date_iso = new Date(`${endDate}T23:59:59+09:00`).toISOString();

    // 실제 API 연동
    const res = await createSurveyPost({
      title,
      content,
      end_date: end_date_iso,
      link: formLink,
      //image,
    });
    requestAnimationFrame(() => navigate(`/posts/${res.post_id}`));

    console.log({ title, content, formLink, endDate });
    toast.push({
      message: "설문 게시글이 등록되었습니다.",
      type: "success",
    });
    onCancel();
  };

  // 유효성 검사
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormLink(value);

    if (value && !urlPattern.test(value)) {
      setError("유효한 URL 형식이 아닙니다.");
    } else {
      setError("");
    }
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
          {/* 설문지 제공자 드롭다운 (선택 즉시 새 창) */}
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

      {/* 에디터 */}
      <div className="flex-1">
        <ToastEditor onChange={setContent} />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 mt-2">
        <Button
          variant="secondary"
          className="min-w-[100px]"
          onClick={() => setShowConfirm(true)}
        >
          취소
        </Button>
        <Button
          variant="primary"
          className="min-w-[100px]"
          onClick={handleSubmit}
        >
          작성
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
