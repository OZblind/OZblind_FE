import Sidebar from "@components/Sidebar/Sidebar";
import HotBoard from "@src/components/HotBoard/HotBoard";
import { useEffect, useState } from "react";

export default function TestMainPage() {
  const [showAd, setShowAd] = useState(false);

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
        {/** 메인 페이지 */}
        <div className="flex flex-col gap-2 items-center justify-center w-[820px] h-full">
          <div className="w-[800px] h-[60px] bg-base-200 my-8"></div>
          <div className="w-[800px] h-[180px] bg-base-200">취업배너</div>
          <HotBoard />
          <div className="w-[800px] h-[360px] bg-base-200 pb-8"></div>
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
    </div>
  );
}
