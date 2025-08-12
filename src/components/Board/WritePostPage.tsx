import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SharedPostForm from "./SharedPostForm";
import SurveyPostForm from "./SurveyPostForm";
import GithubPostForm from "./GithubPostForm";
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
  const navigate = useNavigate();
  const [selectedBoard, setSelectedBoard] = useState("free");

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

      {/* 2. 폼 스위칭 */}
      {selectedBoard === "survey" ? (
        <SurveyPostForm onCancel={() => navigate(-1)} />
      ) : selectedBoard === "github" ? (
        <GithubPostForm onCancel={() => navigate(-1)} />
      ) : (
        <SharedPostForm board={selectedBoard} onCancel={() => navigate(-1)} />
      )}
    </div>
  );
};

export default WritePostPage;
