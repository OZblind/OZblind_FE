import type { Notification } from "./notice.types";

export const MOCK_NOTICES: Notification[] = [
  {
    id: "n1",
    type: "comment",
    text: "", // 사용 안 함
    createdAt: "2025-08-05T11:07:00Z",
    read: false,
    context: {
      board: "자유게시판",
      title: "나도 없어.. 고양이",
      path: "/posts/123#comment-456",
    },
  },
  {
    id: "n2",
    type: "reply",
    text: "", // 사용 안 함
    createdAt: "2025-08-04T11:07:00Z",
    read: true,
    context: {
      board: "간식토론",
      title: "붕어싸만코가 더 맛있더라",
      myComment: "난 요즘 붕어싸만코가 더 맛있더라",
      path: "/posts/789#comment-321",
    },
  },
  {
    id: "n3",
    type: "system",
    text: "시스템 점검 안내",
    createdAt: "2025-08-04T09:11:00Z",
    read: false,
    context: {
      board: "공지",
      title: "다음 주 일정 안내(긴 제목 예시)",
      path: "/notice/11",
    },
  },
];
