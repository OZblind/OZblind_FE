import Sidebar from "@components/Sidebar/Sidebar";
import HotBoard from "@src/components/HotBoard/HotBoard";
import { useEffect } from "react";

export default function TestMainPage() {
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
      </div>
    </div>
  );
}
