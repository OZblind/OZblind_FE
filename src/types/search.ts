import type { RawUserTag } from "@src/types/tag";

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  createdAt: string;
  viewCount: number;
  user?: RawUserTag;
}

// 검색 미리보기 결과 타입
export interface SearchPreview {
  posts: Post[];
  totalCount: number;
}

// Props 타입 정의 - default와 detail 모드 지원
export interface NavUnifiedSearchProps {
  className?: string;
  placeholder?: string;
  mode?: "default" | "detail";
  maxPreviewResults?: number;
}

// 카테고리 타입
export const categories = [
  "전체",
  "자유",
  "취업",
  "정보",
  "설문",
  "GitHub",
] as const;
export type Category = (typeof categories)[number];

// 카테고리 매핑 - 백엔드 호환성을 위해 소문자로 통일
export const categoryMapping: Record<Category, string> = {
  전체: "all",
  자유: "free",
  취업: "jobs",
  정보: "info",
  설문: "survey",
  GitHub: "github", // 백엔드와 대소문자 확인 필요
};
