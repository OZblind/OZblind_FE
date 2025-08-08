import React from "react";
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
  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* 프로필 섹션 */}
        <div className="bg-base-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            {/* 프로필 이미지 */}
            <div className="relative mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-full flex items-center justify-center">
                {userProfile.profileImage ? (
                  <img
                    src={userProfile.profileImage}
                    alt="프로필"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-lg sm:text-2xl">
                      👤
                    </span>
                  </div>
                )}
              </div>

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
    </div>
  );
};

export default MyPageLayout;
