export type TagCategory = "cohort" | "position";

export type Tag = {
  id: string; // ex) "2-cohort", "2-pos"
  category: TagCategory; // "cohort" | "position"
  label: string; // "11기" | "프론트" | "백엔드"
};

/** 서버 응답의 user 태그 구조 (예: /api/posts/:id user) */
export type RawUserTag = {
  id: number; // oz_key.id
  tag_class: "FE" | "BE";
  tag_number: number; // 기수 (예: 11)
};
