import WritePostPage from "@components/Board/WritePostPage"; // 실제 글쓰기 페이지 컴포넌트

const TestPostWritePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">게시글 작성 테스트 페이지</h1>
      <WritePostPage />
    </div>
  );
};

export default TestPostWritePage;
