import Sidebar from "@components/Sidebar/Sidebar";

export default function TestMainPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex items-center justify-center w-9/12">
        <div className="w-[820px] h-[900px] bg-base-200">메인이에용</div>
      </div>
    </div>
  );
}
