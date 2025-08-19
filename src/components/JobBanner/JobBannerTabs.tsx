import { useMemo, useState } from "react";
import LeftTabs from "./LeftTabs";
import Carousel from "./Carousel";
import type { Source } from "@src/types/job";
import { useJobs } from "@src/hooks/useJobs";

type Props = {
  ashbyBoardName?: string;
  greenhouseBoardToken?: string;
  className?: string;
};

export default function JobBannerTabs({
  ashbyBoardName = "Ashby",
  className,
}: Props) {
  const [tab, setTab] = useState<Source>("remoteok");

  // useJobs 내부에서 8~10개 제한, 정렬/중복제거가 이뤄진다고 가정
  const { data, loading, error, canShowMore, showMore } = useJobs(tab, {
    ashby: ashbyBoardName,
    chunkSize: 12, // 한 번에 더 보여줄 개수 (원하는 값으로 조절)
  });

  // 탭 헤더 텍스트 (가독성)
  const heading = useMemo<Record<Source, string>>(
    () => ({
      remoteok: "RemoteOK",
      arbeitnow: "Arbeitnow",
      ashby: "Ashby",
    }),
    []
  );

  return (
    <section className={["flex w-full gap-4", className ?? ""].join(" ")}>
      <LeftTabs value={tab} onChange={setTab} />

      <main className="flex-1 p-2">
        <h2 className="mb-2 font-bold">{heading[tab]}</h2>

        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="text-base-content/70"
          >
            불러오는 중…
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="alert alert-warning">
            에러: {error}
          </div>
        )}

        {!loading && !error && data && data.length === 0 && (
          <div className="text-base-content/60">표시할 공고가 없습니다.</div>
        )}

        {/* 전체 배열 전달 → Carousel이 Swiper로 5~6장 보기 + 좌우 이동 처리 */}
        {!loading && !error && data && data.length > 0 && (
          // key={tab}로 탭 변경 시 캐러셀/스크롤 상태 초기화
          <Carousel
            key={tab}
            items={data}
            hasMore={canShowMore}
            onEndReached={() => showMore()}
          />
        )}
      </main>
    </section>
  );
}
