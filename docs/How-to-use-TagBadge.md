# TagBadge 호출법

작성자: 이명우

## 📌 개요

`useAssignedTags`는 부여된 태그를 자동으로 보여주는 컴포넌트입니다.
User DB 에 저장된 태그를 자동으로 불러와서 지정 위치에 보여줍니다.

---

## 🛠 사용 방법

```ts
import AssignedTagList from "@components/tags/AssignedTagList";
import { useAssignedTags } from "@hooks/useAssignedTags";

// 예시
const designatedKey = "USER-KEY-123"; // 예시
const { tags, loading, error } = useAssignedTags(designatedKey);

<AssignedTagList tags={tags} />;
```
