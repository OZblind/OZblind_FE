import { useState } from "react";
import { Button } from "@components/ui/Button";
import ToastEditor from "@components/Board/editor/ToastEditor";

interface Props {
  onCancel: () => void;
}

export default function GithubPostForm({ onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formLink, setFormLink] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;

  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");
    if (!formLink.trim()) return alert("작성한 설문 링크를 입력하세요.");
    if (!endDate) return alert("설문 종료일을 선택하세요.");

    // 실제 API 연동
    // await createSurveyPost({ title, content, formLink, endDate });

    console.log({ title, content, formLink, endDate });
    alert("설문 게시글이 등록되었습니다. (mock)");
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

      {/* 레포 링크 입력 */}
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
      {/* 레포 미리보기 카드 */}
      {formLink && (
        <div className="p-4 border rounded bg-white shadow-sm mt-1">
          <p className="font-semibold text-lg mb-1">📄 레포 미리보기</p>
          <a
            href={formLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {formLink}
          </a>
        </div>
      )}
      {/* 에디터 */}
      <div className="flex-1">
        <ToastEditor onChange={setContent} />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 mt-2">
        <Button
          variant="secondary"
          className="min-w-[100px]"
          onClick={onCancel}
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
    </div>
  );
}
