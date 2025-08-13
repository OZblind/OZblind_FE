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
  className?: string;
}

const MyPageLayout: React.FC<MyPageLayoutProps> = ({
  userProfile = {
    nickname: "익명",
    userId: "FE001", // 예시: 백엔드에서 받을 실제 사용자 ID
    hasKey: false,
  },
  className,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleProfileClick = () => {
    setIsSettingsOpen(true);
  };

  // 사용자 ID에서 FE/BE 구분하는 함수
  const getUserType = (userId: string) => {
    if (userId.startsWith("FE")) return "FE";
    if (userId.startsWith("BE")) return "BE";
    return "FE"; // 기본값
  };

  // 사용자 ID에서 기수 추출하는 함수 (예: FE001 → 11기, BE002 → 12기)
  const getUserGeneration = (userId: string) => {
    // 실제로는 백엔드에서 기수 정보를 별도로 받거나, ID 패턴에 따라 결정
    // 예시: 임시로 홀수는 11기, 짝수는 12기로 설정
    const idNumber = parseInt(userId.slice(-1)) || 1;
    return idNumber % 2 === 1 ? "11기" : "12기";
  };

  // 타입별 색상 설정
  const getTypeColor = (type: string) => {
    switch (type) {
      case "FE":
        return "bg-gradient-to-r from-blue-500 to-purple-600"; // 클래식 블루-퍼플
      case "BE":
        return "bg-gradient-to-r from-green-500 to-teal-600"; // 그린-틸
      default:
        return "bg-gradient-to-r from-blue-500 to-purple-600";
    }
  };

  // 기수별 색상 설정
  const getGenerationColor = (generation: string) => {
    switch (generation) {
      case "11기":
        return "bg-gradient-to-r from-orange-500 to-red-500"; // 오렌지-레드
      case "12기":
        return "bg-gradient-to-r from-purple-500 to-pink-500"; // 퍼플-핑크
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600"; // 기본값
    }
  };

  const userType = getUserType(userProfile.userId || "");
  const userGeneration = getUserGeneration(userProfile.userId || "");
  const typeColor = getTypeColor(userType);
  const generationColor = getGenerationColor(userGeneration);

  return (
    <div className={`min-h-screen bg-base-100 ${className || ""}`}>
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
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-base-100 rounded-full flex items-center justify-center">
                      <span className="text-base-content text-lg sm:text-2xl">
                        👤
                      </span>
                    </div>
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

            {/* 사용자 정보 - 태그들로만 구성 */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {/* 기수 태그 */}
              <div
                className={`inline-flex items-center justify-center ${generationColor} text-white px-4 py-1.5 rounded-full font-bold shadow-lg select-none text-sm min-w-[60px]`}
                role="tag"
                aria-label={`${userGeneration} 기수`}
              >
                <span>{userGeneration}</span>
              </div>

              {/* FE/BE 태그 */}
              <div
                className={`inline-flex items-center justify-center ${typeColor} text-white px-4 py-1.5 rounded-full font-bold shadow-lg select-none text-sm min-w-[60px]`}
                role="tag"
                aria-label={`${userType} 개발자`}
              >
                <span>{userType}</span>
              </div>
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

      {/* 팀원이 만든 설정 모달 */}
      {isSettingsOpen && (
        <UserSetting
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
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
