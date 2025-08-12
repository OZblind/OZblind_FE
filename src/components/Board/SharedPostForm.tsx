import { useState } from "react";
import ToastEditor from "@components/Board/editor/ToastEditor";
import { Button } from "@components/ui/Button";
// import { createPost } from "@/api/post";

interface Props {
  board: string; // "free" | "job" | "info"
  onCancel: () => void;
}

export default function SharedPostForm({ board, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return alert("제목과 내용을 입력하세요.");
    }
    const payload = { board, title, content };
    console.log("submit shared payload:", payload);
    // await createPost(payload);
    alert("게시글이 등록되었습니다. (mock)");
    onCancel();
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
        <ToastEditor onChange={setContent} />
      </div>

      <div className="flex justify-end gap-4 mt-2">
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
