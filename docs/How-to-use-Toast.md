# Toast 호출법

작성자: 함서연

## 📌 개요

`useToastStore`는 전역에서 토스트 알림을 관리하는 Zustand 스토어입니다.
`push()` 메서드로 토스트를 등록할 수 있으며, `durationMs` 후 자동으로 사라집니다.

---

## 🛠 사용 방법

```ts
import { useToastStore } from "@/stores/toastStore";

// 예시: 성공 토스트
useToastStore.getState().push({
  message: "로그인에 성공했습니다!",
  type: "success", // 선택, "success" | "error" | "warning" | "info" 중 택 1 (기본값: success)
  durationMs: 3000, // 선택 (기본값: 2500ms)
});
```

- `message`: 토스트에 표시할 텍스트 (필수)
- `type`: 토스트 종류 (선택, 기본값 "success")
- `durationMs`: 표시 시간(ms) (선택, 기본값 2500)
