import React, { useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import AssignedTagList from "@src/components/tags/AssignedTagList";
import { profileToTagsMock } from "@src/mocks/tags.mock";
import profileImage from "@assets/images/profile.jpg";

// 사용자 프로필 타입 정의
interface UserProfile {
  nickname?: string;
  userId?: string;
  profileImage?: string;
  hasKey?: boolean;
  cohort?: string; // 기수 정보 추가
  department?: string; // 부서 정보 추가
}

interface MyPageLayoutProps {
  userProfile?: UserProfile;
  className?: string;
}

const MyPageLayout: React.FC<MyPageLayoutProps> = ({
  userProfile = {
    nickname: "익명",
    userId: "FE001",
    hasKey: false,
    cohort: "11기",
    department: "프론트",
  },
  className,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleProfileClick = () => {
    setIsSettingsOpen(true);
  };

  // 태그 생성 (팀원의 시스템 사용)
  const tags = useMemo(() => {
    return profileToTagsMock(
      userProfile.cohort || "11기",
      userProfile.department || "프론트"
    );
  }, [userProfile.cohort, userProfile.department]);

  return (
    <div className={`min-h-screen bg-base-100 ${className || ""}`}>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* 프로필 섹션 */}
        <div className="bg-base-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            {/* 프로필 이미지 */}
            <div className="relative mb-4">
              <button
                onClick={handleProfileClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-base-300 rounded-full flex items-center justify-center transition-all duration-500 hover:bg-primary hover:scale-105 group relative overflow-hidden"
                aria-label="프로필 설정"
              >
                {/* 프로필 아이콘/이미지 */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                  style={{
                    opacity: isHovered ? 0 : 1,
                    transform: isHovered ? "scale(0.8)" : "scale(1)",
                  }}
                >
                  {userProfile.profileImage ? (
                    <img
                      src={userProfile.profileImage}
                      alt="프로필"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <img
                      src={profileImage}
                      alt="프로필"
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>

                {/* 톱니바퀴 아이콘 */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                    isHovered ? "animate-gear-pulse" : ""
                  }`}
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "scale(1.2)" : "scale(0.8)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="text-primary-content"
                  >
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z" />
                  </svg>
                </div>
              </button>

              {/* 키 인증 상태 표시 */}
              {userProfile.hasKey && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                  <span className="text-success-content text-xs">✓</span>
                </div>
              )}
            </div>

            {/* 🔥 기존 하드코딩된 태그를 팀원의 태그 시스템으로 교체 */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
              <AssignedTagList tags={tags} />
            </div>

            {/* 키 인증 안내 */}
            {!userProfile.hasKey && (
              <div className="px-4 py-2 bg-warning text-warning-content text-sm rounded-lg font-medium">
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

      {/* 임시 설정 모달 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">설정</h3>
            <p className="text-neutral-content mb-4">
              설정 기능은 준비 중입니다. UserSetting 컴포넌트가 완성되면
              교체됩니다.
            </p>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 커스텀 애니메이션 CSS */}
      <style>{`
        .animate-gear-pulse {
          animation: growPulse 2s ease-in-out infinite;
        }

        @keyframes growPulse {
          0% {
            transform: scale(1.2);
          }
          50% {
            transform: scale(1.5);
          }
          100% {
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default MyPageLayout;
