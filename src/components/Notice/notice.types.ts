export type Notification = {
  id: string;
  text: string; // 알림 내용
  createdAt: string; // 렌더: mm.dd hh:mm
  read: boolean; // 읽음 여부
  href?: string; // 추후 상세 이동용
};
