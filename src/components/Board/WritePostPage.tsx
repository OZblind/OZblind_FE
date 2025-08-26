import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SharedPostForm from "./SharedPostForm";
import SurveyPostForm from "./SurveyPostForm";
import GitRepoPostForm from "./GithubPostForm";

const boardOptions = [
  { value: "free", label: "자유 게시판" },
  { value: "jobs", label: "취업 게시판" },
  { value: "info", label: "정보 게시판" },
  { value: "survey", label: "설문 게시판" },
  { value: "github", label: "GitHub 게시판" },
];

const WritePostPage = () => {
  const navigate = useNavigate();
  const [selectedBoard, setSelectedBoard] = useState("free");

  // 쿼리 헬퍼
  const [sp, setSp] = useSearchParams();

  // URL이 바뀔 때마다 쿼리 파라미터와 state 동기화
  useEffect(() => {
    const boardFromQuery = sp.get("board");

    if (
      boardFromQuery &&
      boardOptions.some((option) => option.value === boardFromQuery)
    ) {
      setSelectedBoard(boardFromQuery);
    } else {
      setSelectedBoard("free");
      const next = new URLSearchParams(sp);
      next.set("board", "free");
      setSp(next, { replace: true });
    }
  }, [sp, setSp]);

  const setBoardQuery = (value: string | undefined) => {
    const next = new URLSearchParams(sp);
    if (value) next.set("board", value);
    else next.delete("board");
    setSp(next, { replace: true });
  };

  return (
    <div className="flex flex-col w-full h-full gap-2 text-black mb-8">
      {/* 1. 게시판 선택 */}
      <div>
        <select
          id="board-select"
          className="w-full border border-gray-300 rounded p-2"
          value={selectedBoard}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedBoard(v); // 기존 state 그대로 유지
            setBoardQuery(v); // URL ?board= 동기화
          }}
        >
          {boardOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 폼 스위칭 (그대로) */}
      {selectedBoard === "survey" ? (
        <SurveyPostForm onCancel={() => navigate(-1)} />
      ) : selectedBoard === "github" ? (
        <GitRepoPostForm onCancel={() => navigate(-1)} />
      ) : (
        <SharedPostForm board={selectedBoard} onCancel={() => navigate(-1)} />
      )}
    </div>
  );
};

export default WritePostPage;
