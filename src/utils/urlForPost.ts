export const urlForPost = {
  postDetail: (id: string | number) => `/posts/${id}`,
  postCreate: (board?: "free" | "jobs" | "info" | "survey" | "github") =>
    board ? `/write?board=${board}` : `/write`,
  postEdit: (id: string | number) => `/post/${id}/edit`,
} as const;
