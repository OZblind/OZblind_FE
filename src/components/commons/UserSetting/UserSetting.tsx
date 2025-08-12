import { useState } from "react";
import ThemeToggleButton from "./ThemeToggleButton";

export function UserSetting() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
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
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex justify-center items-center z-[2000]">
          <div className="relative bg-base-200 rounded-md p-6 max-w-md w-full h-[500px]">
            <button
              className="absolute top-4 right-4 px-4 text-base-content py-2 rounded-full hover:bg-base-300 transition"
              onClick={() => setIsOpen(false)}
            >
              X
            </button>
            <div className="font-thin">설정</div>
            <div className="flex items-center justify-between border-b border-neutral-content py-6">
              다크 모드 설정
              <ThemeToggleButton />
            </div>

            <div className="border-b border-neutral-content py-6">
              <p className="mb-2">오즈 스쿨 사용자 인증 Key</p>
              {isAuthenticated ? (
                <div className=" p-3 w-full bg-base-300 text-secondary rounded-md">
                  이미 인증된 사용자입니다.
                </div>
              ) : (
                <div className="flex justify-between">
                  <input
                    type="text"
                    placeholder="회원 Key 입력"
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
            <div className="py-6">회원 탈퇴</div>
          </div>
        </div>
      )}
    </>
  );
}
