import { Link } from "react-router-dom";

export default function TestHub() {
  const items = [
    { to: "/test/write", label: "게시글 작성 테스트" },
    { to: "/403", label: "403 테스트" },
    { to: "/500", label: "500 테스트" },
    // 404는 없는 주소
  ];

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Hub</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="rounded-xl border px-4 py-3 text-center hover:bg-gray-50 active:scale-[0.98] transition"
          >
            {it.label}
          </Link>
        ))}

        {/* 404 테스트용: 존재하지 않는 경로로 보내기 */}
        <Link
          to="/_not-exist_404_example"
          className="rounded-xl border px-4 py-3 text-center hover:bg-gray-50 active:scale-[0.98] transition"
        >
          404 테스트
        </Link>
      </div>
    </div>
  );
}
