import profile from "@assets/images/profile.jpg";
import person from "@assets/images/person.png";
import { useAssignedTags } from "@hooks/useAssignedTags";
import AssignedTagList from "../tags/AssignedTagList";
import { Link } from "react-router-dom";
import { PATHS } from "@constants/paths";

export default function SmallProfileSection() {
  const { tags, loading } = useAssignedTags("me");

  return (
    <div className="flex items-center pt-4 pb-2 pr-16">
      {/* 프로필 영역 */}
      <div className="flex justify-center items-center w-[74px] h-[74px] rounded-lg overflow-hidden transform transition-transform duration-300 hover:bg-base-300 hover:scale-105 group">
        {/* Link로 마이페이지 이동 */}
        <Link to={PATHS.MYPAGE} className="relative w-[60px] h-[60px] block">
          <img
            src={profile}
            alt="profile"
            className="w-full h-full object-cover rounded-lg"
          />

          {/* 아이콘: 기본 숨김, 호버 시 표시 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black rounded-lg opacity-0 group-hover:opacity-65 transition-opacity">
            <img src={person} />
          </div>
        </Link>
      </div>

      {/* 태그 영역 */}
      <div className="ml-2 flex items-center min-h-5">
        {loading ? (
          <span className="h-5 w-12 rounded-full bg-base-300 animate-pulse" />
        ) : (
          <AssignedTagList tags={tags} />
        )}
      </div>
    </div>
  );
}
