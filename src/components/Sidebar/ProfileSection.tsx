import profile from "@assets/images/profile.jpg";

export default function ProfileSection() {
  const userTag = "FE 11"; // 임시
  return (
    <>
      <div className="flex flex-col items-center p-8">
        <div className="flex justify-center items-center w-[164px] h-[164px] rounded-full overflow-hidden transform transition-transform duration-300 hover:bg-base-300 hover:scale-105">
          <div className="relative w-[140px] h-[140px]">
            <img
              src={profile}
              alt="profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <p className="p-2">{userTag}</p>
      </div>
    </>
  );
}
