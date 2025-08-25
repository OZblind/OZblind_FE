interface User {
  id: number;
  tag_class: string;
  tag_number: number;
}

export interface Post {
  id: number;
  board: number;
  user: User;
  title: string;
  view_count: number;
  like_count: number;
  created_at: string;
}
