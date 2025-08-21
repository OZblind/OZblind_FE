export type HotPost = {
  id: number;
  title: string;
  board: "자유" | "취업" | "정보" | "설문" | "GitHub";
  likes: number;
};

export const hotPosts: HotPost[] = [
  {
    id: 1,
    title: "오늘 점심 뭐 먹지? 자유롭게 공유해요!",
    board: "자유",
    likes: 87,
  },
  {
    id: 2,
    title: "이번 달 취업 공고 모음",
    board: "취업",
    likes: 65,
  },
  {
    id: 3,
    title: "Git 브랜치 전략 완전 정리",
    board: "GitHub",
    likes: 102,
  },
  {
    id: 4,
    title: "웹 개발 관련 최신 정보 공유",
    board: "정보",
    likes: 42,
  },
  {
    id: 5,
    title: "팀원 설문 조사 참여해주세요",
    board: "설문",
    likes: 78,
  },
];
