# authStore 사용법

작성자: 함서연

## 📌 개요

`authStore`는 [`Zustand`](https://zustand-demo.pmnd.rs/)로 구현된 전역 상태 저장소로,  
**사용자 정보**, **JWT 토큰**, **오즈 키 인증 여부**를 전역에서 관리합니다.

---

## 📥 상태 업데이트 — `setFromAuthPayload`

```ts
useAuthStore.getState().setFromAuthPayload({
  user: {
    userId: "123",
    email: "test@example.com",
    name: "홍길동",
    role: "USER",
    isActive: true,
    socialProvider: "google",
  },
  tokens: {
    accessToken: "ACCESS_TOKEN",
    refreshToken: "REFRESH_TOKEN",
    expiresIn: 3600,
  },
  isOzAuthenticated: true,
});
```

- `user`: 사용자 정보 (`null` 가능)
- `tokens`: 토큰 일부만 전달하면 기존 값 유지
- `isOzAuthenticated`: 오즈 키 인증 완료 여부 (회원 여부와 별개) & 백엔드 user 테이블의 "authenticated"에 해당

## 🔄 토큰 부분 갱신

```ts
useAuthStore.getState().setFromAuthPayload({
  tokens: { accessToken: "NEW_ACCESS_TOKEN" },
});
```

- 필요한 토큰 필드만 전달 가능
- 기존 상태와 병합됨

## 🚪 로그아웃 — `reset`

```ts
useAuthStore.getState().reset();
```

- 사용자 정보, 토큰, 인증 여부 초기화

---

### When to use `getState()`

- Inside actions: 상태를 업데이트하기 전에 현재 상태를 읽어야 할 때
- Non-reactive operations: 계산/비동기 작업 등 컴포넌트 리렌더가 필요 없는 스냅샷이 필요할 때
- Outside React components: 훅을 쓸 수 없는 일반 TS/JS 파일, axios 인터셉터, SSR 컨텍스트 등

여기서는 "UI 상태 변화가 목적이 아닌 비동기 인증 흐름 관리" 목적으로 사용
