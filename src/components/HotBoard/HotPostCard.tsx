import { icons } from "@src/assets";
import { useThemeIcon } from "@hooks/useThemeIcon";
import { useMemo } from "react";
import type { HotPost } from "./data";
import { CARD_STYLE, CARD_TEXT } from "./boardColor";

export default function HotPostCard({ post }: { post: HotPost }) {
  const themeIcon = useThemeIcon();
  const { thumbUp } = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return {
      thumbUp: dark ? icons.thumbUp.dark : icons.thumbUp.light,
    };
  }, [themeIcon]);

  return (
    <button
      className={`flex w-full h-[180px] rounded-lg shadow-md overflow-hidden border-2
        ${CARD_STYLE[post.board]}
        hover:shadow-lg hover:scale-105 transition-all duration-200`}
    >
      <div className="flex flex-col justify-between p-2 flex-1 items-start text-left">
        <div>
          <p className={`text-sm mt-1 ${CARD_TEXT[post.board]}`}>
            {post.board} 게시판
          </p>
          <h3 className="text-lg font-semibold py-0.5 line-clamp-2">
            {post.title}
          </h3>
        </div>
        <div className="flex items-center justify-end text-sm w-full font-thin text-base-content/40">
          <div className="flex items-center gap-1">
            <img src={thumbUp} alt="thumbUp" className="w-4 h-4" /> {post.likes}
          </div>
        </div>
      </div>
    </button>
  );
}
