import { useState } from "react";

export function AccountDeletionSection() {
  const [inputValue, setInputValue] = useState("");
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const isValid = inputValue === "회원 탈퇴";

  const handleDelete = () => {
    if (isValid) {
      // 탈퇴 처리 콜백
    }
  };

  const handleToggle = () => {
    if (isWarningVisible || isConfirmVisible) {
      setIsWarningVisible(false);
      setIsConfirmVisible(false);
      setInputValue("");
    } else {
      setIsWarningVisible(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pt-6 pb-4">
        회원 탈퇴
        <button
          className="text-gray-400 hover:text-info"
          onClick={handleToggle}
        >
          정말 탈퇴하시겠습니까?
        </button>
      </div>

      {isWarningVisible && (
        <div className="p-4 border-2 border-base-300 rounded mb-4">
          <p className="pb-2 text-">
            오즈 key를 입력해야지만 다시 가입할 수 있으며 회원 탈퇴 후 복구가
            불가능합니다.
          </p>
          <p className="text-info pb-1">
            정말 그림자 속으로 떠나버리시겠습니까?
          </p>
          <button
            onClick={() => {
              setIsConfirmVisible(true);
              setIsWarningVisible(false);
            }}
            className="w-full py-2 rounded text-white bg-primary hover:bg-secondary transition"
          >
            네
          </button>
        </div>
      )}

      {isConfirmVisible && (
        <div className="p-4 border-2 border-base-300 rounded">
          <p className="mb-2">탈퇴를 원하시면 "회원 탈퇴"라고 입력해 주세요.</p>
          <input
            type="text"
            placeholder="회원 탈퇴"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border border-base-300 bg-base-100 rounded mb-1 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleDelete}
            disabled={!isValid}
            className={`w-full py-2 rounded text-white ${
              isValid
                ? "bg-red-600 hover:bg-red-700"
                : "bg-base-300 cursor-not-allowed"
            } transition`}
          >
            회원 탈퇴
          </button>
        </div>
      )}
    </>
  );
}
