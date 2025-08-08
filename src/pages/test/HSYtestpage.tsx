import { Toast, ToastContainer } from "../../components/commons/Toast";

export default function HSYtestpage() {
  return (
    <>
      <ToastContainer>
        <Toast message="첫 번째 메시지" />
        <Toast message="두 번째 메시지 두 번째 메시지" />
      </ToastContainer>
    </>
  );
}
