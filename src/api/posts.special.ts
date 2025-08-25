import api from "@api/client";

// -------- 타입 --------
export type CreateSurveyPostPayload = {
  title: string;
  content: string;
  end_date: string | Date; // ISO 또는 Date
  link: string;
  image?: File | Blob | string | null;
};

export type CreateGithubPostPayload = {
  title: string;
  content: string;
  link: string;
  image?: File | Blob | string | null;
};

// -------- 생성 --------
export async function createSurveyPost(p: CreateSurveyPostPayload) {
  const bodyOrForm =
    p.image instanceof File || p.image instanceof Blob
      ? (() => {
          const f = new FormData();
          f.append("title", p.title.trim());
          f.append("content", p.content ?? "");
          f.append(
            "end_date",
            p.end_date instanceof Date ? p.end_date.toISOString() : p.end_date
          );
          f.append("link", p.link);
          if (p.image) f.append("image", p.image);
          return f;
        })()
      : {
          title: p.title.trim(),
          content: p.content ?? "",
          end_date:
            p.end_date instanceof Date ? p.end_date.toISOString() : p.end_date,
          link: p.link,
          ...(typeof p.image === "string" && p.image ? { image: p.image } : {}),
        };

  const { data } = await api.post<{ post_id: number; link: string }>(
    "/api/posts/survey/",
    bodyOrForm,
    p.image instanceof File || p.image instanceof Blob
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );
  return data; // { post_id, link }
}

export async function createGithubPost(p: CreateGithubPostPayload) {
  const bodyOrForm =
    p.image instanceof File || p.image instanceof Blob
      ? (() => {
          const f = new FormData();
          f.append("title", p.title.trim());
          f.append("content", p.content ?? "");
          f.append("link", p.link);
          if (p.image) f.append("image", p.image);
          return f;
        })()
      : {
          title: p.title.trim(),
          content: p.content ?? "",
          link: p.link,
          ...(typeof p.image === "string" && p.image ? { image: p.image } : {}),
        };

  const { data } = await api.post<{ post_id: number; link: string }>(
    "/api/posts/github/",
    bodyOrForm,
    p.image instanceof File || p.image instanceof Blob
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );
  return data; // { post_id, link }
}

// -------- 상세 부가정보 --------
export async function fetchSurveyExtra(id: number) {
  const { data } = await api.get<{ end_date: string; link: string }>(
    `/api/posts/survey/${id}/`
  );
  return data;
}

export async function fetchGithubExtra(id: number) {
  const { data } = await api.get<{ link: string }>(`/api/posts/github/${id}/`);
  return data;
}

// 설문 수정 (POST /api/posts/survey/:id/edit/)
export async function editSurveyPost(
  id: number,
  p: {
    title?: string;
    content?: string;
    end_date?: string | Date;
    link?: string;
    image?: File | Blob | string | null;
  }
) {
  const hasFile = p.image instanceof File || p.image instanceof Blob;
  const body = hasFile
    ? (() => {
        const f = new FormData();
        if (p.title != null) f.append("title", p.title.trim());
        if (p.content != null) f.append("content", p.content ?? "");
        if (p.end_date != null)
          f.append(
            "end_date",
            p.end_date instanceof Date ? p.end_date.toISOString() : p.end_date
          );
        if (p.link != null) f.append("link", p.link);
        if (p.image) f.append("image", p.image);
        return f;
      })()
    : {
        ...(p.title != null ? { title: p.title.trim() } : {}),
        ...(p.content != null ? { content: p.content ?? "" } : {}),
        ...(p.end_date != null
          ? {
              end_date:
                p.end_date instanceof Date
                  ? p.end_date.toISOString()
                  : p.end_date,
            }
          : {}),
        ...(p.link != null ? { link: p.link } : {}),
        ...(typeof p.image === "string" && p.image ? { image: p.image } : {}),
      };

  const { data } = await api.post<{ post_id: number; link: string }>(
    `/api/posts/survey/${id}/edit/`,
    body,
    hasFile ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
  );
  return data;
}

// 깃허브 수정 (POST /api/posts/github/:id/edit/)
export async function editGithubPost(
  id: number,
  p: {
    title?: string;
    content?: string;
    link?: string;
    image?: File | Blob | string | null;
  }
) {
  const hasFile = p.image instanceof File || p.image instanceof Blob;
  const body = hasFile
    ? (() => {
        const f = new FormData();
        if (p.title != null) f.append("title", p.title.trim());
        if (p.content != null) f.append("content", p.content ?? "");
        if (p.link != null) f.append("link", p.link);
        if (p.image) f.append("image", p.image);
        return f;
      })()
    : {
        ...(p.title != null ? { title: p.title.trim() } : {}),
        ...(p.content != null ? { content: p.content ?? "" } : {}),
        ...(p.link != null ? { link: p.link } : {}),
        ...(typeof p.image === "string" && p.image ? { image: p.image } : {}),
      };

  const { data } = await api.post<{ post_id: number; link: string }>(
    `/api/posts/github/${id}/edit/`,
    body,
    hasFile ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
  );
  return data;
}
