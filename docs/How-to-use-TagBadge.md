# TagBadge 호출법

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
