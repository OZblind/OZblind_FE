import type { BoardSlug } from "./board";

// 화면 표시용은 서비스에서 사용하는 내용과 맞춤
export const BOARD_DISPLAY_NAME: Record<BoardSlug, string> = {
  free: "자유 게시판",
  jobs: "취업 게시판",
  info: "정보 게시판",
  survey: "설문 게시판",
  github: "GitHub 게시판",
};
