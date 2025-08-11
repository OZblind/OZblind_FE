import React, { useState } from "react";
import { Outlet } from "react-router-dom";

// 사용자 프로필 타입 정의
interface UserProfile {
  nickname?: string;
  userId?: string;
  profileImage?: string;
  hasKey?: boolean;
}

interface MyPageLayoutProps {
  userProfile?: UserProfile;
}

const MyPageLayout: React.FC<MyPageLayoutProps> = ({
  userProfile = {
    nickname: "익명",
    userId: "사용자 ID",
    hasKey: false,
  },
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleProfileClick = () => {
    setIsSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* 프로필 섹션 */}
        <div className="bg-base-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            {/* 프로필 이미지 - 호버 시 톱니바퀴로 변경 */}
            <div className="relative mb-4">
              <button
                onClick={handleProfileClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-base-300 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-primary hover:scale-105 group"
              >
                {isHovered ? (
                  // 톱니바퀴 아이콘
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="text-primary-content transition-all duration-300 group-hover:rotate-90"
                  >
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z" />
                  </svg>
                ) : userProfile.profileImage ? (
                  <img
                    src={userProfile.profileImage}
                    alt="프로필"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-base-100 rounded-full flex items-center justify-center">
                    <span className="text-base-content text-lg sm:text-2xl">
                      👤
                    </span>
                  </div>
                )}
              </button>

              {/* 키 인증 상태 표시 */}
              {userProfile.hasKey && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                  <span className="text-success-content text-xs">✓</span>
                </div>
              )}
            </div>

            {/* 사용자 정보 */}
            <h2 className="text-lg sm:text-xl font-semibold text-base-content mb-1">
              {userProfile.nickname}
            </h2>
            <p className="text-neutral-content text-xs sm:text-sm">
              {userProfile.userId}
            </p>

            {/* 키 인증 안내 */}
            {!userProfile.hasKey && (
              <div className="mt-3 px-3 py-1 bg-warning text-warning-content text-xs rounded-full">
                키 인증이 필요합니다
              </div>
            )}
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-base-200 rounded-lg shadow-sm min-h-[400px]">
          <Outlet />
        </div>
      </div>

      {/* 팀원이 만든 설정 모달 */}
      {isSettingsOpen && (
        <UserSetting
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default MyPageLayout;
