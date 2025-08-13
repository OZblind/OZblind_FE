# 무한 스크롤을 적용하자: useInfiniteScroll 훅 사용 가이드

작성자: 함서연

## 📌 개요

`useInfiniteScroll`은 **IntersectionObserver**를 이용해
리스트 하단에 도달했을 때 자동으로 다음 데이터를 불러오는 훅입니다.  
`ScrollSentinel` 컴포넌트를 적용하고자 하는 UI의 하단에 두고,
훅에서 제공하는 `sentinelRef`를 `ScrollSentinel`에 연결해 사용합니다.

## 📦 파일 경로

- 훅: `@hooks/useInfiniteScroll`
- 센티넬 컴포넌트: `@components/commons/InfiniteScroll/ScrollSentinel`

## 🛠 사용 방법

1. **데이터 패칭 훅**(예: `useInfiniteQuery`) 준비
2. `useInfiniteScroll` 훅 호출
3. `ScrollSentinel`에 `ref`로 `sentinelRef` 연결

## ✍️ 예시 코드

```tsx
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import ScrollSentinel from "@components/commons/InfiniteScroll/ScrollSentinel";

export default function MyList() {
  const { sentinelRef } = useInfiniteScroll({
    root: null, // 기본: window 스크롤
    rootMargin: "1000px 0px", // 넉넉하게 조기 로드
    threshold: 0, // 살짝만 보여도 트리거
    disabled: false, // 로딩 중/마지막 페이지면 true
    onIntersect: () => {
      console.log("다음 페이지 불러오기");
    },
  });

  return (
    <div>
      {/* ...리스트 아이템 */}
      <ScrollSentinel ref={sentinelRef} />
    </div>
  );
}
```

## 옵션 설명

| 옵션          | 설명                                                              |
| ------------- | ----------------------------------------------------------------- |
| `root`        | 관찰 대상 스크롤 컨테이너 (기본: `null` → window)                 |
| `rootMargin`  | 조기 로드 거리. 값이 클수록 더 일찍 로드 시작 (기본: "600px 0px") |
| `threshold`   | 센티넬이 화면에 보이는 비율 (0\~1) (기본: 0)                      |
| `disabled`    | true면 관찰 중지 (로딩 중/더 없음) (기본: false)                  |
| `onIntersect` | [필수 옵션] 센티넬이 조건을 만족하면 호출될 함수                  |
