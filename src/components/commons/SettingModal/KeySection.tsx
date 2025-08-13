import { useState } from "react";

export function KeySection() {
  const [key, setKey] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLogin = (): void => {
    if (key === "123") {
      setError("");
      alert("로그인 성공");
      setIsAuthenticated(true);
    } else {
      setError("유효하지 않은 키입니다.");
      setIsAuthenticated(false);
    }
  };

  return (
    <div className="border-b border-neutral-content py-6">
      <p className="mb-2">회원 인증</p>
      {isAuthenticated ? (
        <div className=" p-3 w-full bg-base-300 text-secondary rounded-md">
          이미 인증된 사용자입니다.
        </div>
      ) : (
        <div className="flex justify-between">
          <input
            type="text"
            placeholder="발급받은 인증 키를 입력해 주세요."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="flex-1 min-w-0 bg-base-300 border border-base-200 p-2 focus:outline-none focus:border-primary rounded"
          />
          <button
            onClick={handleLogin}
            className="px-4 bg-primary text-white py-2 rounded hover:bg-secondary transition"
          >
            인증
          </button>
        </div>
      )}
      {error && <p className="text-error font-thin">{error}</p>}
    </div>
  );
}
