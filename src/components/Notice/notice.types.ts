export type NoticeType = "comment" | "reply" | "system";

export type NoticeContext = {
  board?: string; // 게시판/섹션명 (추후 게시판 타입으로 대체 가능)
  title?: string; // 내가 쓴 '게시글 제목' (comment용)
  myComment?: string; // 내가 쓴 '댓글 내용' (reply용)
  path?: string; // 클릭 시 라우팅 경로
};

export type Notification = {
  id: string;
  type: NoticeType;
  createdAt: string; // 렌더: mm.dd hh:mm
  read: boolean; // 읽음 여부

  // 1줄: 상단 카피(타입별로 생성)
  text?: string;

  /** 2줄차에 노출할 실제 내용:
   *  - comment: '상대가 남긴 댓글 내용'
   *  - reply:   '상대가 남긴 답글 내용'
   *  - system:  '상세 설명(옵션)'
   */
  detail?: string;

  context?: NoticeContext;
};
