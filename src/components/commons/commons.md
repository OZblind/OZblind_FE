## Toast

```typescript
// Toast + ToastContainer + props 타입 불러오는 법
// Toast + ToastContainer 필수. props 타입은 필요할 경우 불러오세요.
import {
  Toast,
  ToastContainer,
  type ToastProps,
} from "@/components/commons/Toast";

// JSX 사용법
// Toast를 반드시 ToastContainer 안에 넣어서 사용해 주세요.
// Toast에 message props는 필수입니다.
return(
  <ToastContainer>
    <Toast message="첫 번째 메시지" />
    <Toast message="두 번째 메시지 두 번째 메시지" />
  </ToastContainer>
);
```
