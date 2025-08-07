import { useState } from "react";
import ConfirmModal from "../../components/commons/ConfirmModal/ConfirmModal";

export default function HSYtestpage() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>게시글 삭제</button>

      <ConfirmModal
        isOpen={showConfirm}
        title="게시글 작성을 취소하시겠어요?"
        description="지금까지 작성한 정보는 전부 삭제됩니다."
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          // 삭제 로직
          setShowConfirm(false);
        }}
      />
    </>
  );
}
