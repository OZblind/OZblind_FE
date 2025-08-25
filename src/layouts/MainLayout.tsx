import { Link, Outlet } from "react-router-dom";
import Sidebar from "@components/Sidebar/Sidebar";
import { useEffect, useMemo, useState } from "react";
import NavUnifiedSearch from "@src/components/navigation/NavUnifiedSearch";
import { useThemeIcon } from "@src/hooks/useThemeIcon";
import { logos } from "@src/assets";
import { PATHS } from "@src/constants/paths";
import AdBanner from "@src/components/AdBanner/AdBanner";
import AdYoutube from "@src/components/AdBanner/AdYoutube";
import ScrollToTopButton from "@components/commons/ScrollToTop/ScrollToTopButton";
import ScrollRootProvider from "@components/commons/ScrollToTop/ScrollRootProvider";
import { useScrollRoot } from "@components/commons/ScrollToTop/useScrollRoot";

function OutletWithScrollToTop() {
  const { root } = useScrollRoot();
  return (
    <div className="relative w-full">
      <Outlet />
      {/* 레이아웃 안쪽 우하단 고정(sticky). root는 페이지가 등록한 내부 스크롤 엘리먼트 */}
      <div className="sticky bottom-6 w-full pointer-events-none z-[200]">
        <div className="flex justify-end">
          <div className="pointer-events-auto translate-x-2">
            <ScrollToTopButton position="inline" root={root} />
          </div>
        </div>
      </div>
    </div>
  );
}

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
    const checkWidth = () => setShowAd(window.innerWidth >= 1540);
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
      <div className="flex-1 flex justify-center ml-4">
        <div className="flex flex-col w-[820px] h-screen pt-1 box-border min-h-0">
          <div className="flex items-center gap-4 w-full py-8">
            <Link to={PATHS.MAIN}>
              <img src={logo} alt="logo" className="w-24" />
            </Link>
            <NavUnifiedSearch className="w-full" placeholder="통합검색" />
          </div>
          <div className="flex justify-center overflow-y-auto overflow-x-visible scrollbar-hide p-2">
            <ScrollRootProvider>
              <OutletWithScrollToTop />
            </ScrollRootProvider>
          </div>
        </div>
      </div>

      {/** 광고 배너 */}
      {showAd && (
        <div>
          <div className="absolute right-10 top-32 w-[260px] h-[700px] ">
            <AdBanner />
            <AdYoutube />
          </div>
          <div className="w-[200px]"></div>
        </div>
      )}
    </div>
  );
}
