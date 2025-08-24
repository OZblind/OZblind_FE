export const ENDPOINTS = {
  LOGIN_GOOGLE: "/api/auth/social/google/login",
  SIGNUP_GOOGLE: "/api/auth/social/google/signup",
  TOKEN_REFRESH: "/api/auth/token/refresh",
  TOKEN_REVOKE: "/api/auth/token/revoke",
  KEY_VERIFY: "/api/auth/key-verify",
  USER_PROFILE: "/api/user/profile",
  USER_TAG: "/api/user/tag",
  MY_BOOKMARKS: "/api/user/bookmarks",
  MY_COMMENTS: "/api/user/comments",
  MY_POSTS: "/api/user/posts",
  POST_DETAIL: "/api/posts", // (뒤에 /:id/ 붙여서 사용)
} as const;
