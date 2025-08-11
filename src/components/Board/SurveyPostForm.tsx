import { useState } from "react";
import { Button } from "@components/ui/Button";
import ToastEditor from "@components/Board/editor/ToastEditor";
// import { createSurveyPost } from "@/api/post"; // 실제 API 연결 시 사용

interface Props {
  onCancel: () => void;
}

export default function SurveyPostForm({ onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // ToastEditor onChange로 채움
  const [formLink, setFormLink] = useState(""); // 작성된 설문 링크
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");
    if (!formLink.trim()) return alert("작성한 설문 링크를 입력하세요.");
    if (!endDate) return alert("설문 종료일을 선택하세요.");

    const payload = { title, content, formLink, endDate };
    console.log("submit survey payload:", payload);

    // await createSurveyPost(payload);
    alert("설문 게시글이 등록되었습니다. (mock)");
    onCancel();
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

      {/* 설문지 작성 바로가기 */}
      <div>
        <span className="block font-semibold mb-1 text-white">
          설문지 작성 바로가기
        </span>
        <div className="flex items-center gap-3">
          {/* 버튼 그룹 */}
          <div className="flex gap-2 shrink-0">
            <Button
              variant="primary"
              onClick={() => openExternal("https://forms.google.com")}
            >
              구글 폼 열기
            </Button>
            <Button
              variant="primary"
              onClick={() => openExternal("https://form.naver.com/")}
            >
              네이버 폼 열기
            </Button>
            <Button
              variant="primary"
              onClick={() => openExternal("https://moaform.com")}
            >
              모아폼 열기
            </Button>
          </div>
          {/* 작성된 설문 링크 */}
          <input
            id="survey-link"
            type="url"
            className="flex-1 border border-gray-300 rounded p-2"
            placeholder="예) https://forms.gle/xxxx"
            value={formLink}
            onChange={(e) => setFormLink(e.target.value)}
          />
        </div>
      </div>
      {/* 설문 종료일 */}
      <div>
        <label
          htmlFor="survey-end"
          className="block font-semibold mb-1 text-white"
        >
          설문 종료일
        </label>
        <input
          id="survey-end"
          type="date"
          className="w-full border border-gray-300 rounded p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <p className="text-xs text-white/60 mt-1">
          종료일 23:59 (Asia/Seoul) 기준으로 마감 처리 권장.
        </p>
      </div>

      {/* 에디터 */}
      <div className="flex-1">
        <label className="block font-semibold mb-1 text-white">내용</label>
        <ToastEditor onChange={setContent} />
      </div>

      {/* 버튼 섹션 (우하단 정렬) */}
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
