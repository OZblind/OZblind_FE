// src/mocks/post.demo.ts
import type { PostMeta, CommentMeta } from "@src/types/post";

export const demoPost: PostMeta = {
  id: "p1",
  boardName: "니똥 게시판",
  title: "제목입니다랍다랍다락",
  content:
    "이건 글입니다라달락\n하하호호 여긴 OO게시판 어떤 글을 써야 좋을까요○\n하하하↵\n와랄라랄라라 랄라↵\n샤랄랄라랄라 랄 ㅋㅋㅋㅋ",
  cohort: "11기",
  category: "프론트",
  createdAt: "2025-04-03T12:36:00+09:00",
  views: 1494,
  commentsCount: 4,
  reactions: { like: 4, dislike: 0, bookmark: 3 },
  authorId: "u1",
  authorName: "홍길동",
};

export const demoComments: CommentMeta[] = [
  {
    id: "c1",
    author: "리구",
    authorId: "u2",
    authorName: "이리구",
    content:
      "이건 댓글을 마시따 (이 댓글에 답글이 있으며, 답글을 펼쳐둔 상태입니다.)",
    createdAt: "2025-04-03T12:43:00+09:00",
    liked: false,
    disliked: false,
    likes: 8,
    dislikes: 2,
    hasReplies: true,
    replies: [
      {
        id: "c1-1",
        author: "악어",
        authorId: "u3",
        authorName: "권여진",
        content: "프론트 11기 최고의 아웃풋 도왕어선 권여진",
        createdAt: "2025-04-03T12:43:30+09:00",
        liked: true,
        disliked: false,
        likes: 1,
        dislikes: 0,
      },
    ],
  },
  {
    id: "c2",
    author: "곰돌이",
    authorId: "u4",
    authorName: "김곰돌",
    content: "대구의 딸 권여진",
    createdAt: "2025-04-03T12:43:00+09:00",
    liked: false,
    disliked: false,
    likes: 0,
    dislikes: 0,
  },
  {
    id: "c3",
    author: "권후로",
    authorId: "u5",
    authorName: "권후로",
    content: "이 댓글엔 답글이 있으며, 답글 작성을 누른 상태입니다.",
    createdAt: "2025-04-03T12:43:00+09:00",
    liked: false,
    disliked: false,
    likes: 0,
    dislikes: 2,
  },
  {
    id: "c4",
    author: "강아지",
    authorId: "u6",
    authorName: "멍멍이",
    content:
      "메타메타몽몽 메타메타몽몽 메타메타메타메타몽몽 (이 댓글엔 답글이 없습니다.)",
    createdAt: "2025-04-03T12:43:00+09:00",
    liked: true,
    disliked: false,
    likes: 578,
    dislikes: 0,
  },
];
