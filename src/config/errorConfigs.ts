import image404 from "../assets/images/error/404.png";
import image403 from "../assets/images/error/403.png";
import image500 from "../assets/images/error/500.png";

export const ERROR_CONFIGS = {
  403: {
    title: "403 Forbidden",
    imageSrc: image403,
    imageAlt: "403 접근 금지 캐릭터들",
    description: "이 페이지에 접근할 권한이 없습니다.",
  },
  404: {
    title: "404 Not Found",
    imageSrc: image404,
    imageAlt: "404 페이지를 찾을 수 없음 캐릭터들",
    description: "요청하신 페이지를 찾을 수 없습니다.",
  },
  500: {
    title: "500 Internal Server Error",
    imageSrc: image500,
    imageAlt: "500 서버 오류 캐릭터",
    description: "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CONFIGS;
