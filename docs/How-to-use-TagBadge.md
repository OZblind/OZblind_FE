# TagBadge 호출법 (목 버전)

작성자: 이명우

## 📌 개요

`useAssignedTags`는 부여된 태그를 자동으로 보여주는 컴포넌트입니다.
User DB 에 저장된 태그를 자동으로 불러와서 지정 위치에 보여줍니다.

---

## 🛠 사용 방법

### fetch Tag

```ts
import { useAssignedTags } from "@hooks/useAssignedTags";
import AssignedTagList from "@components/tags/AssignedTagList";

// 예시
const { tags, loading, error } = useAssignedTags();

<AssignedTagList tags={tags} />;
```

### 프로필 값으로 직접 생성

```ts
import { profileToTagsMock } from "@mocks/tags.mock";
const tags = profileToTagsMock("11기", "프론트");
```

---

# TagBadge 호출법 (서버 & 목 통합 훅 버전)

작성자: 함서연 (2025.08.23)

## 📌 개요

기존 명우 님의 `useAssignedTags` 기능을 최대한 유지하면서,
현재 로그인 사용자 또는 게시글 작성자의 태그(기수/포지션)을 불러와 배지로 표시할 수 있도록 하였습니다.

실서버에서는 오즈키(`GET /api/user/tag`, `GET /api/posts/:id/`)를 우선 사용하고, 목/구버전 환경에서는 프로필(`GET /api/user/profile`)로 자동 폴백됩니다.

## 🛠 사용 방법

### 1) 현재 로그인 사용자 태그

```ts
import { useAssignedTags } from "@hooks/useAssignedTags";
import AssignedTagList from "@components/tags/AssignedTagList";

const { tags, loading, error, valid } = useAssignedTags("me");

return <AssignedTagList tags={tags} />;
```

### 2) 게시글 작성자 태그 (응답에 user가 이미 있을 때)

```ts
import { useAssignedTags } from "@hooks/useAssignedTags";
import AssignedTagList from "@components/tags/AssignedTagList";

// post.user: { id, tag_class: "FE"|"BE", tag_number: number }
const { tags, loading, error, valid } = useAssignedTags("author", {
  inlineUser: post.user,
});

return <AssignedTagList tags={tags} />;
```

### 3) 게시글 작성자 태그 (user가 없어서 상세 호출이 필요할 때)

```ts
import { useAssignedTags } from "@hooks/useAssignedTags";
import AssignedTagList from "@components/tags/AssignedTagList";

const { tags, loading, error, valid } = useAssignedTags("author", {
  postId: post.id, // 내부에서 /api/posts/:id/ 1회 호출
});

return <AssignedTagList tags={tags} />;
```

## 참고사항

- `valid`: “기수 1개 + 포지션 1개”가 모두 존재하면 `true`. 아니면 `false`이며 `error`에 이유가 담깁니다.
- 목/개발 환경에서도 동일 코드로 동작합니다(프로필 폴백 자동).
