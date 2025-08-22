import { useState } from "react";

export function AccountDeletionSection() {
  const [inputValue, setInputValue] = useState("");
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const isValid = inputValue === "회원 탈퇴";

  const handleDelete = () => {
    if (isValid) {
      setIsConfirmVisible(false);
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
        <button
          className="text-gray-400 hover:text-info"
          onClick={handleToggle}
        >
          회원 탈퇴
        </button>
      </div>

      {isWarningVisible && (
        <div className="p-4 border-2 border-base-300 rounded mb-4">
          <p className="pb-2">회원 탈퇴 시</p>
          <div className="mb-2 bg-red-600/10 rounded p-2 text-red-600">
            <p>• 회원 정보와 이용·인증 기록이 모두 삭제됩니다.</p>
            <p>• 재가입 시 가입과 인증을 처음부터 진행해야 합니다.</p>
            <p>• 삭제된 정보는 복구할 수 없습니다.</p>
          </div>
          <p className="text-info pb-1">정말 그림자 속으로 떠나버리겠습니까?</p>
          <button
            onClick={() => {
              setIsConfirmVisible(true);
              setIsWarningVisible(false);
            }}
            className="w-full py-2 rounded text-white bg-primary hover:bg-secondary transition"
          >
            확인했습니다
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
