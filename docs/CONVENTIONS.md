## Branch 컨벤션🎀

| 종류        | 브랜치명                  | 예시               | 설명                             |
| ----------- | ------------------------- | ------------------ | -------------------------------- |
| **Main**    | `main`                    | `main`             | 최종 배포용 브랜치               |
| **Develop** | `develop`                 | `develop`          | 기능 통합 및 배포 전 작업 브랜치 |
| **Feature** | `feature/이슈번호-기능명` | `feature/5-signin` | 개별 기능 개발 브랜치            |
| **Hotfix**  | `hotfix-버전`             | `hotfix-1.1.4`     | 배포 이후 긴급 수정 브랜치       |
| **Release** | `release-버전`            | `release-1.1`      | 배포 준비를 위한 브랜치          |

> 규칙
>
> - 기능 개발 전, **이슈를 생성한 후** 브랜치를 생성합니다.
> - 브랜치명은 **소문자**를 사용하고, 단어는 또는 `/`로 구분합니다.
> - 브랜치는 관련 이슈에 링크되어야 합니다.

---

## Commit Message 컨벤션

- 깃허브에 익숙지 않은 팀원을 위해 한 줄 커밋 사용
- 한국어로 내용 작성

**형식**

`<타입>: <변경 내용>(<이슈 번호>)`

> 커밋 메시지는 현재까지의 수정사항을 한눈에 파악 가능하게 작성합니다.
>
> 예시:
>
> `feat: 기본 CRUD 기능 작성(#3)`

### Commit Type

| 커밋 유형        | 의미                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------- |
| feat             | 새로운 기능 추가, 컴포넌트 파일 생성                                                      |
| fix              | 코드(버그) 또는 UI의 문제 해결                                                            |
| docs             | 문서 수정                                                                                 |
| style            | 코드 formatting, 세미콜론 누락, 코드 자체의 변경이 없는 경우 (엔터 쳐서 한줄 비우는 경우) |
| refactor         | 코드 리팩토링                                                                             |
| test             | 테스트 코드, 리팩토링 테스트 코드 추가, 더미 데이터 사용시                                |
| chore            | 패키지 매니저 수정, 그 외 기타 수정 ex) .gitignore                                        |
| design           | CSS 등 사용자 UI 디자인 변경 (tailwind 사용시)                                            |
| types            | 타입 및 인터페이스 정의                                                                   |
| comment          | 필요한 주석 추가 및 변경                                                                  |
| rename           | 파일 또는 폴더 명을 수정하거나 옮기는 작업만인 경우                                       |
| remove           | 파일을 삭제하는 작업만 수행한 경우                                                        |
| revert           | 원래의 코드로 되돌리는 경우                                                               |
| init             | 초기화 관련 작업                                                                          |
| !BREAKING CHANGE | 커다란 API 변경의 경우                                                                    |
| !HOTFIX          | 급하게 치명적인 버그를 고쳐야 하는 경우                                                   |

---

## 네이밍 컨벤션

| 타입            | 예시                                      |
| --------------- | ----------------------------------------- |
| 상수(Constant)  | SCREAMING_SNAKE_CASE (MAX_VALUE, API_URL) |
| Boolean 변수    | is접두사 (isActive)                       |
| 일반 변수, 함수 | camelCase 사용 (userName, itemList)       |
| 컴포넌트        | PascalCase (UserCard, LoginForm)          |
| 커스텀 훅       | use + PascalCase (useScroll, useAuth)     |
| 배열            | 복수형 사용 (users, items)                |
| 객체            | 단수형 사용 (user, item)                  |
| 이벤트 핸들러   | handle 접두사 (handleSubmit)              |
| 비동기 함수     | fetch 접두사 (fetchDat)                   |
| 타입스크립트    | type                                      |

---

## 개발 규칙

- 모든 작업은 **이슈 생성 → 브랜치 생성 → 작업 → PR(develop 브랜치에)** 순으로 진행합니다.
- 하나의 브랜치에서는 **하나의 이슈만** 처리합니다.
- 커밋 메시지는 **위 컨벤션**을 따릅니다.
- 코드 변경 사항은 PR 전 **Lint & Formatter**를 통과해야 합니다.
- PR과 이슈 템플릿은 추후 확정 후 공유 예정입니다.

---

## 추후 정리 예정 항목

- PR 제목 및 본문 템플릿
- 이슈 템플릿 (Bug / Feature / Refactor 등)
- ESLint, Prettier 설정 공유(.eslintrc, .prettierrc)
- 폴더 구조(components/, hooks/, pages/, assets/ 등)
- 전역 상태 관리 방식 등, 프로젝트 요구사항에 맞는 라이브러리와 세팅 등
