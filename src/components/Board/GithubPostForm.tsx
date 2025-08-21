import { useState } from "react";
import { Button } from "@components/ui/Button";
import ToastEditor from "@components/Board/editor/ToastEditor";
import { RepoPreviewCard } from "./RepoPreviewCard";
import { useNavigate } from "react-router-dom";
import { createGithubPost } from "@src/api/posts.special";

interface Props {
  onCancel: () => void;
}

export default function GitRepoPostForm({ onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;

  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");
    if (!repoLink.trim()) return alert("작성한 레포 주소를 입력하세요.");

    // 실제 API 연동
    const res = await createGithubPost({ title, content, link: repoLink });
    navigate(`/posts/${res.post_id}`);
    alert("깃 레포 게시글이 등록되었습니다. (mock)");
    onCancel();
  };

  // 유효성 검사
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepoLink(value);

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
      {repoLink && <RepoPreviewCard repoLink={repoLink} />}

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
