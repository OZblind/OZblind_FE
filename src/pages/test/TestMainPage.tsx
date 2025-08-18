import Sidebar from "@components/Sidebar/Sidebar";
import HotBoard from "@src/components/HotBoard/HotBoard";

export default function TestMainPage() {
  return (
    <div className="relative flex w-full h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center w-[820px] max-h-[900px]">
          <div className="w-[800px] h-[180px] bg-base-200">취업배너</div>
          <HotBoard />
        </div>
      </div>
    </div>
  );
}
