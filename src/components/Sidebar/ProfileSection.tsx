import profile from "@assets/images/profile.jpg";
import AssignedTagList from "../tags/AssignedTagList";
import { profileToTagsMock } from "@src/mocks/tags.mock";

export default function ProfileSection() {
  const tags = profileToTagsMock("11기", "프론트");
  return (
    <div className="flex flex-col items-center p-8">
      <div className="flex justify-center items-center w-[164px] h-[164px] rounded-full overflow-hidden transform transition-transform duration-300 hover:bg-base-300/50 hover:scale-105">
        <button className="relative w-[140px] h-[140px]">
          <img
            src={profile}
            alt="profile"
            className="w-full h-full object-cover rounded-full"
          />
        </button>
      </div>
      <AssignedTagList tags={tags} />
    </div>
  );
}
