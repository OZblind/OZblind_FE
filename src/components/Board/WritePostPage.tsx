import { useState } from "react";
import ToastEditor from "@components/Board/editor/ToastEditor";
// import { createPost } from "@/api/post"; // 게시글 생성 API 추후 등록
// import { Button } from "@/components/ui/button"; // 버튼 컴포넌트 (Tailwind 기반)

const boardOptions = [
  { value: "free", label: "자유 게시판" },
  { value: "job", label: "취업 게시판" },
  { value: "info", label: "정보 게시판" },
  { value: "survey", label: "설문 게시판" },
  { value: "github", label: "GitHub 게시판" },
];

const WritePostPage = () => {
  const [selectedBoard, setSelectedBoard] = useState("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  console.log(content);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-8 gap-2 text-black">
      {/* 1. 게시판 선택 */}
      <div>
        <label
          htmlFor="board-select"
          className="block font-semibold mb-2 text-white"
        >
          게시판 작성
        </label>
        <select
          id="board-select"
          className="w-full border border-gray-300 rounded p-2"
          value={selectedBoard}
          onChange={(e) => setSelectedBoard(e.target.value)}
        >
          {boardOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 제목 입력 */}
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

      {/* 3. 에디터 */}
      <div className="flex-1">
        <ToastEditor onChange={setContent} />
      </div>

      {/* 4. 버튼 섹션 */}
    </div>
  );
};

export default WritePostPage;
