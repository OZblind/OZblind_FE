import profile from "@assets/images/profile.jpg";

export default function SmallProfileSection() {
  const userTag = "FE 11"; // 임시
  return (
    <div className="flex items-center pt-4 pb-2 pr-28">
      <div className="flex justify-center items-center w-[74px] h-[74px] rounded-lg overflow-hidden transform transition-transform duration-300 hover:bg-base-300 hover:scale-105">
        <div className="relative w-[60px] h-[60px]">
          <img
            src={profile}
            alt="profile"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
      <p className="p-2">{userTag}</p>
    </div>
  );
}
