export interface PostMeta {
  id: string;
  boardName: string; // 예: "OO 게시판"
  boardSlug: "free" | "jobs" | "info" | "survey" | "github";
  title: string;
  content: string; // \n 포함 가능
  cohort?: string; // 예: "11기"
  category?: string; // 예: "Front"
  createdAt: string; // ISO
  views: number;
  commentsCount: number;
  reactions: { like: number; dislike: number; bookmark: number };
  // 작성자 정보 추가
  authorId: string;
  authorName?: string;

  // --- 설문 깃 전용 필드 ---
  formLink?: string; // 설문 링크
  endDate?: string; // 설문 마감일 (YYYY-MM-DD)
  repoUrl?: string; // GitHub 게시판 전용
}

export interface CommentMeta {
  id: string;
  author: string;
  content: string;
  createdAt: string; // ISO
  liked: boolean;
  disliked: boolean;
  likes: number;
  dislikes: number;
  hasReplies?: boolean; // 서버 플래그
  replies?: CommentMeta[]; // 사전 로드되었을 때
  // 작성자 정보 추가
  authorId: string;
  authorName?: string;
}
