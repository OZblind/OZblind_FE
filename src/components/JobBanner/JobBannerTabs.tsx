import { useState } from "react";
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

  const { data, loading, error, canShowMore, showMore } = useJobs(tab, {
    ashby: ashbyBoardName,
    chunkSize: 12,
  });

  return (
    <section className={["-mt-4", className ?? ""].join(" ")}>
      {/* 상단으로 이동한 탭 */}
      <div className="mb-2">
        <LeftTabs value={tab} onChange={setTab} />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="w-full">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">불러오는 중...</div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-red-700 text-sm">에러: {error}</div>
          </div>
        )}

        {!loading && !error && data && data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            표시할 공고가 없습니다.
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (
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
