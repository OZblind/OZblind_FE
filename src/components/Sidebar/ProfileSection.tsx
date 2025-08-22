import profile from "@assets/images/profile.jpg";
import person from "@assets/images/person.png";
import AssignedTagList from "../tags/AssignedTagList";
import { profileToTagsMock } from "@src/mocks/tags.mock";
import { Link } from "react-router-dom";
import { PATHS } from "@src/constants/paths";

export default function ProfileSection() {
  const tags = profileToTagsMock("11기", "프론트");
  return (
    <div className="flex flex-col items-center p-8">
      <div className="flex justify-center items-center w-[164px] h-[164px] rounded-full overflow-hidden transform transition-transform duration-300 hover:bg-base-300/50 hover:scale-105">
        <Link
          to={PATHS.MYPAGE}
          className="relative w-[140px] h-[140px] block group"
        >
          <img
            src={profile}
            alt="profile"
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black rounded-full opacity-0 group-hover:opacity-65 transition-opacity">
            <img src={person} />
          </div>
        </Link>
      </div>
      <AssignedTagList tags={tags} />
    </div>
  );
}
