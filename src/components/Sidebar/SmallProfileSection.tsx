import profile from "@assets/images/profile.jpg";
import { profileToTagsMock } from "@src/mocks/tags.mock";
import AssignedTagList from "../tags/AssignedTagList";

export default function SmallProfileSection() {
  const tags = profileToTagsMock("11기", "프론트");
  return (
    <div className="flex items-center pt-4 pb-2 pr-16">
      {/* 프로필 영역 */}
      <div className="flex justify-center items-center w-[74px] h-[74px] rounded-lg overflow-hidden transform transition-transform duration-300 hover:bg-base-300 hover:scale-105">
        <button className="relative w-[60px] h-[60px]">
          <img
            src={profile}
            alt="profile"
            className="w-full h-full object-cover rounded-lg"
          />
        </button>
      </div>

      {/* 태그 영역 */}
      <div className="ml-2 flex items-center">
        <AssignedTagList tags={tags} />
      </div>
    </div>
  );
}
