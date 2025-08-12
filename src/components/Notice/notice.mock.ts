import type { Notification } from "./notice.types";

export const MOCK_NOTICES: Notification[] = [
  {
    id: "n1",
    type: "comment",
    createdAt: "2025-08-05T11:07:00Z",
    read: false,
    context: { title: "나만 고양이 없어ㅜㅜ", path: "/posts/123#comment-456" },
    detail: "나도 없어.. 고양이", // 상대가 남긴 '댓글' 내용
  },
  {
    id: "n2",
    type: "reply",
    createdAt: "2025-08-04T11:07:00Z",
    read: true,
    context: {
      title: "황치즈 뿅또아 맛있지 않음?",
      myComment:
        "난 요즘 붕어싸만코가 더 맛있더라. 이유를 쓰자면 한도 끝도 없지만, 아무튼 근본 아이스크림이 제일 좋은 듯. 변치 않는 맛 최고야.",
      path: "/posts/789#comment-321",
    },
    detail:
      "맞죠! 근데 전 찰떡 아이스 파예요. 지피티가 제 말 찰떡같이 알아들어 주길 바라며 하나하나 먹고 있답니다. 쫄깃한 식감에 더해, 그렇게 먹는 맛이 있는 것 같아요.", // 상대가 남긴 '답글' 내용
  },
  {
    id: "n3",
    type: "system",
    createdAt: "2025-08-04T09:11:00Z",
    read: false,
    text: "시스템 점검 안내",
    detail: "25/08/06 02:00~03:00 점검 예정입니다.",
  },
];
