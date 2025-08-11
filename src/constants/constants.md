## paths.ts에 라우트 경로 상수화

라우트 path를 위 파일에 상수로 정리해두었습니다.

## endpoints.ts에 백엔드 API 엔드포인트(상대경로) 정리

참고로, baseUrl은 .env의 VITE_API_BASE_URL입니다.

## queryKeys.ts

- `queryKeys`는 TanStack Query의 `queryKey`모음집
- React Query는 이 `queryKey` 값을 기준으로 캐시를 저장
- 즉, 현재(25.08.10) 저장되어 있는 두 개의 `queryKey`(auth, currentUser)는 "이 데이터가 어떤 데이터인지" 알려주는 이름표
  - 같은 `queryKey`로 호출하면 → 이전에 가져온 캐시 데이터를 재사용
  - 다른 queryKey로 호출하면 → 새로 요청
