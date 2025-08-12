export type NoticeType = "comment" | "reply" | "system";

export type NoticeContext = {
  board?: string; // 게시판/섹션명
  title?: string; // 원글(게시글) 제목
  myComment?: string; // 내가 쓴 댓글 내용(답글 알림용)
  path?: string; // 라우팅 경로(추후 이동)
};

export type Notification = {
  id: string;
  text: string; // // system일 때 사용, 나머지 타입은 빌드된 카피가 우선
  createdAt: string; // 렌더: mm.dd hh:mm
  read: boolean; // 읽음 여부
  type: NoticeType;
  context?: NoticeContext;
};
