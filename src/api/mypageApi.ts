import { api, tokenStore } from "@api/client";
import {
  deleteComment as deleteCommentApi,
  extractNickHeader,
  DELETED_PLACEHOLDER,
} from "@src/api/comments";
import type {
  BookmarkItem,
  PostItem,
  MyPageCardData,
  BookmarksResponse,
  PostsResponse,
  DeleteResponse,
  MyPageCardItem,
} from "@src/types/mypage";

/* ========= 전역 타입 보강 ========= */
declare global {
  interface Window {
    queryClient?: import("@tanstack/react-query").QueryClient;
  }
}

/* ========= 타입 ========= */
export interface UserTag {
  tag_class: string;
  tag_number: number;
}

export interface MyPageCommentItem {
  id: number;
  postId: number;
  postTitle: string;
  postCategory: string;
  commentContent: string;
  date: string;
}

export interface MyPageCommentsResponse {
  success: boolean;
  data: MyPageCommentItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
}

interface PostDetailResponse {
  id: number;
  board: number;
  user: { id: number; tag_class: string; tag_number: number };
  title: string;
  content: string;
  image: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
  root_comments: string;
  bookmarks: string;
}

interface PostListItem {
  id: number;
  board: number;
  title: string;
  created_at: string;
  view_count: number;
  comment_count?: number;
  user?: { id?: number; tag_class?: string; tag_number?: number };
}

type PostListResponse = { results: PostListItem[]; count?: number };

interface JwtPayload {
  user_id?: number | string;
  id?: number | string;
  sub?: number | string;
  [k: string]: unknown;
}

// 아이콘 타입 정의
type IconType = "posts" | "comments" | "bookmarks";

function getBoardName(boardId: number): string {
  const map: Record<number, string> = {
    1: "자유",
    2: "정보",
    3: "취업",
    4: "설문",
    5: "GitHub",
  };
  return map[boardId] || "일반";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function toFiniteNumber(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

async function fetchPostDetail(postId: number): Promise<PostDetailResponse> {
  const res = await api.get<PostDetailResponse>(`/api/posts/${postId}/`, {
    withCredentials: true,
  });
  return res.data;
}

function invalidateRelatedCaches(context: string): void {
  if (typeof window !== "undefined" && window.queryClient) {
    window.queryClient.invalidateQueries({
      predicate: (query: { queryKey: readonly unknown[] }) => {
        const key = (query.queryKey ?? [])
          .map((v) => String(v))
          .join("-")
          .toLowerCase();
        return (
          key.includes("comment") ||
          key.includes("activity") ||
          key.includes("summary") ||
          key.includes("posts") ||
          key.includes("bookmarks")
        );
      },
    });
    console.log(`${context}: 관련 캐시 무효화 완료`);
  }
}

/* ========= 내 신원 ========= */
export type MeShape = {
  id?: number;
  tag_class?: string;
  tag_number?: number;
} | null;

function safeDecodeJwt(token?: string): JwtPayload | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = globalThis.atob
      ? globalThis.atob(payloadB64)
      : Buffer.from(payloadB64, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function getMyIdFromToken(): number | undefined {
  const payload = safeDecodeJwt(tokenStore?.access);
  const raw = payload?.user_id ?? payload?.id ?? payload?.sub;
  return toFiniteNumber(raw);
}

export async function getMyIdentity(): Promise<MeShape> {
  const id = getMyIdFromToken();
  let tag: UserTag | null = null;
  try {
    const res = await api.get<UserTag>("/api/user/tag", {
      withCredentials: true,
      validateStatus: (s) => s === 200 || s === 404,
    });
    if (res.status === 200) tag = res.data;
  } catch {
    /* ignore */
  }

  if (!id && !tag) return null;
  return {
    ...(id ? { id } : {}),
    ...(tag ? { tag_class: tag.tag_class, tag_number: tag.tag_number } : {}),
  };
}

export const getMyProfile = async (): Promise<UserTag> => {
  const res = await api.get<UserTag>("/api/user/tag", {
    withCredentials: true,
  });
  return res.data;
};

const MAX_SCAN_PAGES = 5;

export const getMyPosts = async (
  page: number = 1,
  pageSize: number = 20
): Promise<PostsResponse> => {
  // 내 신원
  const me = await getMyIdentity();
  const myId = me?.id;
  const myTagClass = me?.tag_class;
  const myTagNumber = me?.tag_number;

  // 이 글이 "내 글"인지 판별 (상세조회 없이 목록의 user 필드로 판단)
  const isMineByUser = (u?: {
    id?: number;
    tag_class?: string;
    tag_number?: number;
  }) => {
    if (!u) return false;
    if (typeof myId === "number" && typeof u.id === "number")
      return u.id === myId;
    if (myTagClass && myTagNumber && u.tag_class && u.tag_number) {
      return u.tag_class === myTagClass && u.tag_number === myTagNumber;
    }
    return false;
  };

  // 이 페이지를 만들기 위해 필요한 "내 글" 누적 개수
  const needUntil = page * pageSize;

  // 서버 페이지를 1부터 차례로 스캔하면서 내 글을 모은다
  const seenIds = new Set<number>();
  const mine: PostListItem[] = [];

  let serverPage = 1;
  // 너무 과도한 스캔 방지: 최소 page까지는 보장, 여유로 MAX_SCAN_PAGES 더 본다
  const scanCeil = Math.max(page + MAX_SCAN_PAGES, page); // ex) page=3이면 최소 8페이지까지

  while (mine.length < needUntil && serverPage <= scanCeil) {
    const res = await api.get<PostListResponse>("/api/posts/", {
      params: {
        page: serverPage,
        page_size: pageSize, // 서버 페이지 크기 = 클라 페이지 크기(정렬/경계 안정화)
        ordering: "-created_at", // 최신순 힌트(백엔드가 무시해도 무해)
      },
      withCredentials: true,
      validateStatus: (s) => s === 200 || s === 404,
    });

    const results =
      res.status === 200 && Array.isArray(res.data?.results)
        ? res.data.results
        : [];

    if (results.length === 0) break; // 페이지 없음(404 또는 빈 결과)

    for (const p of results) {
      if (!isMineByUser(p.user)) continue;
      if (seenIds.has(p.id)) continue; // 중복 제거
      seenIds.add(p.id);
      mine.push(p);
      if (mine.length >= needUntil) break;
    }

    serverPage += 1;
  }

  // 안정적인 최신순 정렬(날짜 ↓, 동일시각은 id ↓)
  mine.sort((a, b) => {
    const at = +new Date(a.created_at);
    const bt = +new Date(b.created_at);
    if (bt !== at) return bt - at;
    const ai = typeof a.id === "number" ? a.id : Number(a.id);
    const bi = typeof b.id === "number" ? b.id : Number(b.id);
    return (bi || 0) - (ai || 0);
  });

  // 요청한 페이지 구간만 슬라이스(이전 페이지에서 본 글 제외 효과)
  const start = (page - 1) * pageSize;
  const slice = mine.slice(start, start + pageSize);

  // MyPage용 PostItem으로 매핑
  const mapped: PostItem[] = slice.map((base) => ({
    id: base.id,
    category: getBoardName(base.board),
    title: base.title,
    date: base.created_at,
    views: base.view_count,
    comments: base.comment_count ?? 0,
    authorId: base.user?.id ?? 0,
  }));

  // 총합은 스캔한 범위 내에서의 "내 글" 개수(백엔드 한계상 정확 총합은 계산 불가)
  const collectedTotal = mine.length;

  return {
    success: true,
    data: mapped,
    pagination: {
      currentPage: page,
      itemsPerPage: pageSize,
      totalItems: collectedTotal, // 스캔된 범위 내 총합
      totalPages: Math.max(1, Math.ceil(collectedTotal / pageSize)),
    },
  };
};

export const getMyComments = async (
  page: number = 1,
  pageSize: number = 20
): Promise<MyPageCommentsResponse> => {
  try {
    const res = await api.get<unknown>("/api/comments/me", {
      withCredentials: true,
    });

    type RawComment = {
      id: number;
      post: number;
      content: string;
      created_at?: string;
      updated_at?: string;
    };

    const payload = res.data;
    const raw: RawComment[] = Array.isArray(payload)
      ? (payload as RawComment[])
      : payload
      ? [payload as RawComment]
      : [];

    const filteredRaw = raw.filter((c) => {
      const { content } = extractNickHeader(c.content);
      return content.trim() !== DELETED_PLACEHOLDER;
    });

    const uniquePostIds = [
      ...new Set(filteredRaw.map((c) => c.post).filter(Boolean)),
    ] as number[];

    const detailMap = new Map<number, PostDetailResponse>();
    await Promise.all(
      uniquePostIds.map(async (pid) => {
        try {
          const detail = await fetchPostDetail(pid);
          detailMap.set(pid, detail);
        } catch (error) {
          console.warn(`게시글 ${pid} 상세 조회 실패:`, error);
        }
      })
    );

    const allItems: MyPageCommentItem[] = filteredRaw.map((c) => {
      const detail = detailMap.get(c.post);
      return {
        id: c.id,
        postId: c.post,
        postTitle: detail?.title ?? "(제목 없음)",
        postCategory: getBoardName(detail?.board ?? 0),
        commentContent: c.content,
        date: c.created_at ?? detail?.created_at ?? "",
      };
    });

    const start = (page - 1) * pageSize;
    const pageItems = allItems.slice(start, start + pageSize);

    return {
      success: true,
      data: pageItems,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(allItems.length / pageSize)),
        itemsPerPage: pageSize,
        totalItems: allItems.length,
      },
    };
  } catch {
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 0,
        totalItems: 0,
      },
    };
  }
};

/* ========= 내 북마크 (자동 감지 / 404 안전) ========= */
type BookmarkRow = { postId: number; title: string };

function isBookmarkRow(v: unknown): v is BookmarkRow {
  return (
    isRecord(v) &&
    typeof (v as Record<string, unknown>).postId === "number" &&
    Number.isFinite((v as Record<string, unknown>).postId as number) &&
    (typeof (v as Record<string, unknown>).title === "string" ||
      typeof (v as Record<string, unknown>).title === "undefined")
  );
}

function hasBookmarksArray(v: unknown): v is { bookmarks: BookmarkRow[] } {
  return (
    isRecord(v) &&
    Array.isArray((v as { bookmarks?: unknown }).bookmarks) &&
    (v as { bookmarks: unknown[] }).bookmarks.every(isBookmarkRow)
  );
}

export const getMyBookmarks = async (
  page: number = 1,
  pageSize: number = 20
): Promise<BookmarksResponse> => {
  try {
    const listRes = await api.get<{ bookmarks?: BookmarkRow[] } | unknown[]>(
      "/api/bookmarks/",
      { withCredentials: true, validateStatus: (s) => s === 200 || s === 404 }
    );

    let rawList: BookmarkRow[] = [];

    if (listRes.status === 200) {
      const payload = listRes.data;
      if (hasBookmarksArray(payload)) {
        rawList = payload.bookmarks;
      } else if (Array.isArray(payload)) {
        const arr = payload as unknown[];
        for (const item of arr) {
          if (isRecord(item) && isRecord((item as { post?: unknown }).post)) {
            const p = (item as { post: Record<string, unknown> }).post;
            const pid = p.postId;
            const id = toFiniteNumber(pid);
            if (typeof id === "number") {
              rawList.push({
                postId: id,
                title: typeof p.title === "string" ? p.title : "",
              });
            }
          }
        }
      }
    } else {
      const meRes = await api.get<{ bookmarks?: BookmarkRow[] } | unknown[]>(
        "/api/bookmarks/me",
        { withCredentials: true, validateStatus: (s) => s === 200 || s === 404 }
      );
      if (meRes.status === 200) {
        const payload = meRes.data;
        if (hasBookmarksArray(payload)) {
          rawList = payload.bookmarks;
        } else if (Array.isArray(payload)) {
          const arr = payload as unknown[];
          for (const item of arr) {
            if (isRecord(item) && isRecord((item as { post?: unknown }).post)) {
              const p = (item as { post: Record<string, unknown> }).post;
              const pid = p.postId;
              const id = toFiniteNumber(pid);
              if (typeof id === "number") {
                rawList.push({
                  postId: id,
                  title: typeof p.title === "string" ? p.title : "",
                });
              }
            }
          }
        }
      }
    }

    const uniquePostIds = [...new Set(rawList.map((b) => b.postId))];
    const detailMap = new Map<number, PostDetailResponse>();
    await Promise.all(
      uniquePostIds.map(async (pid) => {
        try {
          const detail = await fetchPostDetail(pid);
          detailMap.set(pid, detail);
        } catch (error) {
          console.warn(`게시글 ${pid} 상세 조회 실패:`, error);
        }
      })
    );

    const allItems: BookmarkItem[] = rawList.map((b) => {
      const detail = detailMap.get(b.postId);
      return {
        id: b.postId,
        postId: b.postId,
        title: detail?.title || b.title || "(제목 없음)",
        category: getBoardName(detail?.board ?? 0),
        date: detail?.created_at ?? "",
        bookmarkedDate: "",
      };
    });

    const start = (page - 1) * pageSize;
    const pageItems = allItems.slice(start, start + pageSize);

    return {
      success: true,
      data: pageItems,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(allItems.length / pageSize)),
        itemsPerPage: pageSize,
        totalItems: allItems.length,
      },
    };
  } catch {
    return {
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 0,
        totalItems: 0,
      },
    };
  }
};
export async function fetchMyPosts(params: {
  page: number;
  pageSize: number;
}): Promise<{
  data: PostListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems?: number;
    totalPages?: number;
  };
}> {
  const { page, pageSize } = params;

  try {
    const res = await api.get<PostListResponse>("/api/posts/", {
      params: {
        page,
        page_size: pageSize,
        // 백엔드 수정 불가이므로, OrderingFilter 허용 필드에 맞춰 안전하게 사용
        // (views.py 기준: created_at, view_count) → 최신순
        ordering: "-created_at",
      },
      withCredentials: true,
      // out-of-range 페이지는 404가 오므로 예외로 던지지 않게 처리
      validateStatus: (s) => s === 200 || s === 404,
    });

    if (res.status === 404) {
      // 존재하지 않는 페이지: 빈 결과를 반환하고, total은 알 수 없으니 생략
      return {
        data: [],
        pagination: {
          page,
          pageSize,
        },
      };
    }

    const list = Array.isArray(res.data?.results) ? res.data.results : [];
    const totalItems =
      typeof res.data?.count === "number" ? res.data.count : undefined;
    const totalPages =
      typeof totalItems === "number"
        ? Math.max(1, Math.ceil(totalItems / pageSize))
        : undefined;

    return {
      data: list,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  } catch {
    // 네트워크/직렬화 오류 등: 안전한 기본값 반환
    return {
      data: [],
      pagination: {
        page,
        pageSize,
      },
    };
  }
}
const PREVIEW_LIMIT = 4;

export const getMyActivitySummary = async (): Promise<MyPageCardData[]> => {
  try {
    const [postsResult, commentsResult, bookmarksResult] = await Promise.all([
      getMyPosts(1, 50).catch(() => null),
      getMyComments(1, 50).catch(() => null),
      getMyBookmarks(1, 50).catch(() => null),
    ]);

    return [
      {
        title: "작성글",
        count: postsResult?.pagination?.totalItems ?? 0,
        icon: "posts" as IconType,
        path: "posts",
        items:
          postsResult?.data?.slice(0, PREVIEW_LIMIT).map(
            (post): MyPageCardItem => ({
              id: post.id,
              postId: post.id,
              title: post.title,
              date: post.date,
              category: post.category,
            })
          ) ?? [],
      },
      {
        title: "작성댓글",
        count: commentsResult?.pagination?.totalItems ?? 0,
        icon: "comments" as IconType,
        path: "comments",
        items:
          commentsResult?.data?.slice(0, PREVIEW_LIMIT).map(
            (c): MyPageCardItem => ({
              id: c.id,
              postId: c.postId,
              title: c.postTitle,
              date: c.date,
              category: c.postCategory,
            })
          ) ?? [],
      },
      {
        title: "북마크",
        count: bookmarksResult?.pagination?.totalItems ?? 0,
        icon: "bookmarks" as IconType,
        path: "bookmarks",
        items:
          bookmarksResult?.data?.slice(0, PREVIEW_LIMIT).map(
            (b): MyPageCardItem => ({
              id: b.id,
              postId: b.postId,
              title: b.title,
              date: b.date,
              category: b.category,
            })
          ) ?? [],
      },
    ];
  } catch {
    return [
      {
        title: "작성글",
        count: 0,
        icon: "posts" as IconType,
        path: "posts",
        items: [],
      },
      {
        title: "작성댓글",
        count: 0,
        icon: "comments" as IconType,
        path: "comments",
        items: [],
      },
      {
        title: "북마크",
        count: 0,
        icon: "bookmarks" as IconType,
        path: "bookmarks",
        items: [],
      },
    ];
  }
};

/* ========= 삭제 ========= */
export const deleteBookmarks = async (
  bookmarkIds: number[]
): Promise<DeleteResponse> => {
  await Promise.all(
    bookmarkIds.map((postId) =>
      api.delete(`/api/bookmarks/${postId}/`, { withCredentials: true })
    )
  );
  invalidateRelatedCaches("북마크 삭제");
  return {
    success: true,
    deletedCount: bookmarkIds.length,
    message:
      bookmarkIds.length === 1
        ? "북마크가 삭제되었습니다."
        : `${bookmarkIds.length}개의 북마크가 삭제되었습니다.`,
  };
};

export const deleteComments = async (
  commentIds: Array<number | string>
): Promise<DeleteResponse> => {
  const ids = (commentIds ?? [])
    .map((v) => (typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v))
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

  if (ids.length === 0) {
    return {
      success: false,
      deletedCount: 0,
      message: "삭제할 댓글이 선택되지 않았습니다",
    };
  }

  const results = await Promise.allSettled(
    ids.map((id) => deleteCommentApi(id))
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const fail = ids.length - ok;

  if (ok > 0) invalidateRelatedCaches("댓글 삭제");

  return {
    success: ok > 0,
    deletedCount: ok,
    message:
      fail === 0
        ? ok === 1
          ? "댓글이 삭제되었습니다"
          : `${ok}개의 댓글이 삭제되었습니다`
        : ok === 0
        ? "댓글 삭제에 실패했습니다"
        : `${ok}개 삭제, ${fail}개 실패했습니다`,
  };
};

export const deletePosts = async (
  postIds: number[]
): Promise<DeleteResponse> => {
  await Promise.all(
    postIds.map((id) =>
      api.delete(`/api/posts/${id}/`, { withCredentials: true })
    )
  );
  invalidateRelatedCaches("게시글 삭제");
  return {
    success: true,
    deletedCount: postIds.length,
    message:
      postIds.length === 1
        ? "게시글이 삭제되었습니다"
        : `${postIds.length}개의 게시글이 삭제되었습니다`,
  };
};
