import type { ApiNotification } from "@api/notifications";
import type { Notification } from "@components/Notice/notice.types";

export function mapApiToNotice(n: ApiNotification): Notification {
  const hasPost = !!n.post;
  return {
    id: String(n.id),
    type: hasPost ? "comment" : "system",
    text: n.message,
    detail: hasPost ? n.post!.title : n.message,
    read: n.is_read,
    createdAt: n.created_at,
    context: hasPost
      ? {
          title: n.post!.title,
          path: `/posts/${n.post!.id}`,
          myComment: undefined,
        }
      : undefined,
  };
}
