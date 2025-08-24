import { useState } from "react";
import { tokenStore } from "@api/client";

export function KeySection() {
  const [key, setKey] = useState<string>("");
  const [error, setError] = useState<string>("");
  const idToken = tokenStore.access;

  const handleLogin = (): void => {
    if (key === "123") {
      setError("");
      alert("로그인 성공");
    } else {
      setError("유효하지 않은 키입니다.");
    }
  };

  return (
    <div className="border-b border-neutral-content py-6">
      <p className="mb-2">회원 인증</p>
      {idToken ? (
        <div className=" p-3 w-full bg-base-300 text-secondary rounded-md">
          이미 인증된 사용자입니다.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex justify-between"
        >
          <input
            type="text"
            placeholder="발급받은 인증 키를 입력해 주세요."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="flex-1 min-w-0 bg-base-300 border border-base-200 p-2 focus:outline-none focus:border-primary rounded"
          />
          <button
            type="submit"
            className="px-4 bg-primary text-white py-2 rounded hover:bg-secondary transition"
          >
            인증
          </button>
        </form>
      )}
      {error && <p className="text-error font-thin">{error}</p>}
    </div>
  );
}
