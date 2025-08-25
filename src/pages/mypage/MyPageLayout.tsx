import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AssignedTagList from "@src/components/tags/AssignedTagList";
import { useAssignedTags } from "@hooks/useAssignedTags";
import profileImage from "@assets/images/profile.jpg";
import { SettingsPage } from "@components/SettingModal/SettingsPage";
import { ThemeInitializer } from "@components/SettingModal/ThemeInitializer";

interface UserProfile {
  nickname?: string;
  userId?: string;
  profileImage?: string;
  hasKey?: boolean;
  cohort?: string;
  department?: string;
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
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"oz_dark" | "oz_light">("oz_dark");
  const [isHovered, setIsHovered] = useState(false);
  const { tags, loading: tagLoading, valid } = useAssignedTags("me");
  const hasKey = valid || Boolean(userProfile.hasKey);
  const handleProfileClick = () => setIsSettingsOpen(true);

  return (
    <div className="bg-base-100 min-h-screen">
      {/* 상단 컨테이너: 메인과 동일 */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* 프로필 섹션 */}
        <div className="bg-base-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <button
                onClick={handleProfileClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-base-300 rounded-full flex items-center justify-center transition-all duration-500 hover:bg-primary hover:scale-105 group relative overflow-hidden"
                aria-label="프로필 설정"
              >
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
                    className="text-white"
                  >
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z" />
                  </svg>
                </div>
              </button>

              {hasKey && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                  <span className="text-success-content text-xs">✓</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 min-h-6">
              {!tagLoading && <AssignedTagList tags={tags} />}
              {tagLoading && (
                <span className="h-5 w-14 rounded-full bg-base-300 animate-pulse" />
              )}
            </div>

            {!hasKey && !tagLoading && (
              <div className="px-4 py-2 bg-warning text-warning-content text-sm rounded-lg font-medium">
                키 인증이 필요합니다
              </div>
            )}
          </div>
        </div>

        {/* 메인 컨텐츠 — 메인 카드 폭과 통일 */}
        <div className="bg-base-200 rounded-lg shadow-sm">
          <div className="max-w-[900px] mx-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </div>
      </div>

      <SettingsPage
        isOpen={isSettingsOpen}
        setIsOpen={setIsSettingsOpen}
        theme={theme}
        setTheme={setTheme}
      />
      <ThemeInitializer setTheme={setTheme} />

      <style>{`
        .animate-gear-pulse { animation: growPulse 2s ease-in-out infinite; }
        @keyframes growPulse {
          0% { transform: scale(1.2); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default MyPageLayout;
