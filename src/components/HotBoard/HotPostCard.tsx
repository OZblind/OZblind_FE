import { useMemo } from "react";
import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import type { HotPost } from "@src/types/hotPost";
import { CARD_STYLE, CARD_TEXT } from "./boardColor";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export default function HotPostCard({
  post,
  num,
}: {
  post: HotPost;
  num: number;
}) {
  const navigate = useNavigate();
  const themeIcon = useThemeIcon();
  const { thumbUp } = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return {
      thumbUp: dark ? icons.thumbUp.dark : icons.thumbUp.light,
    };
  }, [themeIcon]);
  const BOARD_NAME_MAP: Record<number, string> = {
    1: "자유",
    2: "취업",
    3: "정보",
    4: "설문",
    5: "GitHub",
  };

  return (
    <button
      className={`relative flex w-full h-[148px] rounded-lg shadow-md overflow-hidden border-2
        ${CARD_STYLE[post.board]}
        hover:shadow-lg hover:scale-105 transition-all duration-200`}
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <span
        className={`absolute top-[74px] right-1 text-[60px] opacity-15 ${
          CARD_TEXT[post.board]
        }`}
      >
        {num}
      </span>

      <div className="flex flex-col justify-between p-2 flex-1 items-start text-left">
        <div>
          <p className={`text-sm mt-1 ${CARD_TEXT[post.board]}`}>
            {BOARD_NAME_MAP[post.board]} 게시판
          </p>
          <h3 className="text-lg font-semibold py-0.5 line-clamp-2">
            {post.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm w-full font-thin text-base-content/40">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.view_count}
          </div>
          <div className="flex items-center gap-1">
            <img src={thumbUp} alt="thumbUp" className="w-4 h-4 opacity-40" />
            {post.like_count}
          </div>
        </div>
      </div>
    </button>
  );
}
