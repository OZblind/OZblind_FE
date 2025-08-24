export const urlForPost = {
  /** 상세: /board/:board/post/:id */
  postDetail: (
    board: "free" | "jobs" | "info" | "survey" | "github",
    id: string | number
  ) => `/posts/${id}`,

  /** 작성: /write?board=... (board 없으면 /write) */
  postCreate: (board?: "free" | "jobs" | "info" | "survey" | "github") =>
    board ? `/write?board=${board}` : `/write`,

  /** 수정: /post/:id/edit */
  postEdit: (id: string | number) => `/post/${id}/edit`,
} as const;
