import { Outlet } from "react-router-dom";
import ScrollToTopButton from "./ScrollToTopButton";
import { useScrollRoot } from "./useScrollRoot";

/** Outlet에 맨 위로 가기 버튼 붙이는 기능으로, root는 해당 페이지가 등록한 내부 스크롤 엘리먼트 */
export default function OutletWithScrollToTop() {
  const { root } = useScrollRoot();
  return (
    <div className="relative w-full">
      <Outlet />
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
