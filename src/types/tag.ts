export type TagCategory = "cohort" | "position";

export type Tag = {
  id: string;
  label: string;
  category: TagCategory; // cohort or position
  color?: string;
  locked: true; // 지정태그
};
