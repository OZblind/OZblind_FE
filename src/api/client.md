# client.ts 설명

작성자: 함서연

## client.ts란?

공용 Axios 인스턴스 + 인증 토큰 자동 처리 레이어

## 간단 사용법

`api.get("/path")` 또는 `api.post("/path", data)`로 요청하면, `client.ts`가 알아서 `Authorization` 헤더 부착 + 401 시 토큰 자동 재발급 + 원 요청 재시도까지 처리해줍니다.

## 하는 일

1.  요청 인터셉터

    - Zustand 전역 상태(useAuthStore)에서 accessToken을 꺼내
      `Authorization: Bearer <token>` 헤더를 자동으로 부착합니다.

2.  응답 인터셉터 (401 Unauthorized HTTP 처리)
    - API 응답이 401이면 refresh 토큰으로 access 토큰을 1회 갱신 시도합니다.
    - 동시 다발적으로 401이 발생해도, refresh 요청은 **한 번만** 날리고
      나머지는 큐에 대기시킨 뒤, 갱신이 끝나면 **원요청을 재시도**합니다.
    - refresh 실패 시에는 전역 인증 상태를 초기화(reset)합니다.

## 이 파일을 쓰는 이유

- 각 API 모듈은 이 `api` 인스턴스만 사용하면 토큰 부착/갱신/재시도를 신경 쓸 필요가 없습니다.
- 인증 흐름은 네트워크 레이어에서 일관되게 관리됩니다.
