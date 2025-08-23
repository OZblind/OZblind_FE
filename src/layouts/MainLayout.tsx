import { Link, Outlet } from "react-router-dom";
import Sidebar from "@components/Sidebar/Sidebar";
import { useEffect, useMemo, useState } from "react";
import NavUnifiedSearch from "@src/components/navigation/NavUnifiedSearch";
import { useThemeIcon } from "@src/hooks/useThemeIcon";
import { logos } from "@src/assets";
import { PATHS } from "@src/constants/paths";

export default function MainLayout() {
  const [showAd, setShowAd] = useState(false);

  const themeIcon = useThemeIcon();
  const { logo } = useMemo(() => {
    const dark = themeIcon === "oz_dark";
    return {
      logo: dark ? logos.symbol.dark : logos.symbol.light,
    };
  }, [themeIcon]);

  // 브라우저 창 너비를 감지해 광고 배너를 노출할지 결정
  useEffect(() => {
    const checkWidth = () => setShowAd(window.innerWidth >= 1600);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // 페이지 로드 시 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <div className="flex-1 flex justify-center">
        <div className="flex flex-col w-[820px] h-screen pt-1 box-border min-h-0">
          <div className="flex items-center gap-4 w-full py-8">
            <Link to={PATHS.MAIN}>
              <img src={logo} alt="logo" className="w-24" />
            </Link>
            <NavUnifiedSearch className="w-full" placeholder="통합검색" />
          </div>
          <div className="flex justify-center overflow-y-auto overflow-x-visible scrollbar-hide p-1">
            <Outlet />
          </div>
        </div>
      </div>

      {/** 광고 배너 */}
      {showAd && (
        <div>
          <div className="absolute right-10 top-20 w-[300px] h-[900px] bg-base-300 p-4">
            광고 배너
          </div>
          <div className="w-[240px]"></div>
        </div>
      )}
    </div>
  );
}
