# authStore 전역 상태 관리

## 📌 개요

`authStore`는 **사용자 인증 상태, 토큰, 사용자 정보**를 전역에서 관리하기 위해 [`Zustand`](https://zustand-demo.pmnd.rs/)로 구현한 전역 상태 저장소입니다.  
Google 로그인, JWT 토큰 갱신, 오즈 키 인증 여부(`isOzAuthenticated`)까지 모두 이 스토어를 통해 일관성 있게 관리합니다.

---

## 🗂 타입 정의

```ts
// User 정보
export type User = {
  userId: string;
  email: string;
  name?: string;
  role?: string;
};

// JWT 토큰 정보
export type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn?: number | null;
};
```

## 🏗 AuthState 구조

```ts
export type AuthState = {
  user: User | null;
  isOzAuthenticated: boolean | null; // 서버의 authenticated 값에 매핑 (회원 여부와 별개)
  tokens: Tokens;
  setFromAuthPayload: (p: {
    user?: User | null;
    tokens?: Partial<Tokens>;
    isOzAuthenticated?: boolean | null;
  }) => void;
  reset: () => void;
};
```

## ⚙ 주요 메서드

```ts
// 인증 응답(payload)로부터 상태 업데이트
setFromAuthPayload: (p) =>
  set((state) => ({
    user: p.user !== undefined ? p.user : state.user,
    isOzAuthenticated:
      p.isOzAuthenticated !== undefined
        ? p.isOzAuthenticated
        : state.isOzAuthenticated,
    tokens: p.tokens !== undefined
      ? { ...state.tokens, ...p.tokens } // 기존 토큰 일부만 갱신 가능
      : state.tokens,
  })),

// 인증 상태 초기화
reset: () =>
  set({
    user: null,
    isOzAuthenticated: null,
    tokens: { accessToken: null, refreshToken: null, expiresIn: null },
  }),

```

## 🔄 동작 흐름 예시

- 참고: When to use `getState()`
  - Inside actions: 상태를 업데이트하기 전에 현재 상태를 읽어야 할 때
  - For non-reactive operations: 계산/비동기 작업 등 컴포넌트 리렌더가 필요 없는 스냅샷이 필요할 때
  - Outside React components: 훅을 쓸 수 없는 일반 TS/JS 파일, axios 인터셉터, SSR 컨텍스트 등
- 여기서는 "UI 상태 변화가 목적이 아닌 비동기 인증 흐름 관리" 목적으로 사용

```ts
// 1) 로그인 성공 시 — 서버 응답을 FE 표준으로 어댑트 후 저장
const r = await loginWithGoogle(idToken); // { status, payload }
if (r.status === 200 && r.payload) {
  const { user, tokens, isOzAuthenticated } = r.payload; // isOzAuthenticated ≡ backend authenticated (회원 여부와 별개)
  useAuthStore
    .getState()
    .setFromAuthPayload({ user, tokens, isOzAuthenticated });
}

// 2) 토큰 갱신 시 — axios 인터셉터 내부 혹은 별도 로직에서 스냅샷 업데이트
useAuthStore.getState().setFromAuthPayload({
  tokens: {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: newExpiresIn,
  },
});

// 3) 로그아웃 시 — 서버에 revoke 후 전역 상태 초기화
try {
  await revokeToken();
} catch {
  /* 네트워크 오류시에도 클라이언트 상태 초기화 */
}
useAuthStore.getState().reset();
```
