import PostDetail from "@components/Post/PostDetail"; // 실제 글쓰기 페이지 컴포넌트
import { demoPost } from "@src/mocks/post.demo";

const TestPostReadPage = () => {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">게시글 읽기 테스트 페이지</h1>
      <PostDetail post={demoPost} />
    </div>
  );
};

export default TestPostReadPage;
