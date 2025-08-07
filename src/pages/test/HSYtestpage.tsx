import { useState } from "react";
import Toast, { ToastContainer } from "../../components/commons/Toast";

export default function HSYtestpage() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <button onClick={() => setShowToast(true)}>토스트 보기</button>

      {/* 단일 토스트 */}
      {showToast && <Toast message="완료되었습니다!" />}

      {/* 또는 여러 토스트 스택 */}
      <ToastContainer>
        <Toast message="첫 번째 메시지" />
        <Toast message="두 번째 메시지" />
      </ToastContainer>
    </>
  );
}
