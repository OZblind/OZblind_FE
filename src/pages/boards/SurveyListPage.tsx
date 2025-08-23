import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SurveyList } from "@components/Board/survey";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { formatYyyyMmDdHms } from "@utils/date";
import { useSurveys } from "@src/hooks/useSurveys";
import { urlForPost } from "@src/utils/urlForPost";
import { mapToSurveyCard } from "@src/features/posts/list/adapters";
import type { PostListItem } from "@api/posts";
import type { SurveyCardProps } from "@components/Board/survey/SurveyCard";
import type { SurveyExtra } from "@src/features/posts/list/adapters";
import AssignedTagList from "@components/tags/AssignedTagList";
import { adaptUserTag } from "@src/features/tags/adapters";
import type { RawUserTag } from "@api/tags";

/** 타입 가드: 배열이 PostListItem[] 인지 판별 */
function isPostListItemArray(arr: unknown[]): arr is PostListItem[] {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const x = arr[0] as Record<string, unknown>;
  // TODO[API-TYPE-GUARD]: 필요 시 key 집합 강화(예: 'id','title','user','board','created_at')
  return (
    typeof x === "object" &&
    x !== null &&
    "user" in x &&
    "board" in x &&
    "created_at" in x
  );
}

/** 작성자 태그 원본 타입 가드 */
function isRawUserTag(u: unknown): u is RawUserTag {
  return (
    typeof u === "object" &&
    u !== null &&
    typeof (u as { id?: unknown }).id === "number" &&
    (u as { tag_class?: unknown }).tag_class !== undefined &&
    typeof (u as { tag_number?: unknown }).tag_number === "number"
  );
}

/** 설문 부가정보 키 탐색 (any 금지) */
type ExtraCarriers =
  | { extra?: SurveyExtra }
  | { survey?: SurveyExtra }
  | { survey_extra?: SurveyExtra }
  | object;

function getSurveyExtra(obj: unknown): SurveyExtra | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const o = obj as Partial<ExtraCarriers>;
  // TODO[API-EXTRA-KEY]: 백엔드 필드명 확정되면 하나만 남기고 나머지 삭제
  return (
    (o as { extra?: SurveyExtra }).extra ??
    (o as { survey?: SurveyExtra }).survey ??
    (o as { survey_extra?: SurveyExtra }).survey_extra ??
    undefined
  );
}

export default function SurveyListPage() {
  const nav = useNavigate();

  const [lastLoadedAt, setLastLoadedAt] = useState(
    formatYyyyMmDdHms(new Date())
  );
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    refetch,
  } = useSurveys();

  // pages → flat → (원본이면 어댑터로) UI 매핑
  const items: SurveyCardProps[] = useMemo(() => {
    const flat = data?.pages.flatMap((p) => p.items as unknown[]) ?? [];

    if (isPostListItemArray(flat)) {
      // 원본(API) → 어댑터 적용 + 작성자 태그 배지(tagSlot) 주입
      return flat.map((it) => {
        const card = mapToSurveyCard(it, getSurveyExtra(it));
        const maybeUser = (it as { user?: unknown }).user;
        const rawUser = isRawUserTag(maybeUser) ? maybeUser : null;
        const authorTags = adaptUserTag(rawUser);
        return authorTags.length > 0
          ? { ...card, tagSlot: <AssignedTagList tags={authorTags} /> }
          : card;
      });
    }

    // 이미 SurveyCardProps[]인 경우 → 그대로 전달
    return flat as SurveyCardProps[];
  }, [data]);

  // 초기 로딩/스켈레톤 제어
  const isInitialLoading = items.length === 0 && !!isFetching;
  const listIsLoading = isInitialLoading || isFetchingNextPage;

  // 무한 스크롤
  const { sentinelRef } = useInfiniteScroll({
    root: rootEl,
    rootMargin: "400px 0px",
    threshold: 0,
    disabled: listIsLoading || !hasNextPage || isError,
    onIntersect: async () => {
      await fetchNextPage();
      setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    },
  });

  const handleRefresh = useCallback(() => {
    setLastLoadedAt(formatYyyyMmDdHms(new Date()));
    refetch();
  }, [refetch]);

  const errorText =
    isError && error && typeof error === "object" && "message" in error
      ? (error as { message?: string }).message
      : "설문 목록을 불러오는 중 문제가 발생했습니다.";

  return (
    <div className="self-stretch w-[800px] max-w-full p-4">
      <section className="w-full rounded-xl border border-base-content/30 p-3 pb-8 h-[calc(100vh-200px)] overflow-hidden">
        <SurveyList
          items={items}
          onItemClick={(id) => nav(urlForPost.postDetail("survey", id))}
          topBar={{
            boardName: "설문 게시판",
            onOpenSort: () => {}, // TODO[UI→API-SORT]: 정렬 상태를 useSurveys 파라미터로 연결
            onOpenTag: () => {}, // TODO[UI→API-TAGS]: 태그 필터를 훅/서버에 연결
            onWrite: () => nav(urlForPost.postCreate("survey")),
          }}
          lastLoadedAt={lastLoadedAt}
          onRefresh={handleRefresh}
          isLoading={listIsLoading}
          isError={isError}
          errorText={isError ? errorText : undefined}
          hasMore={!!hasNextPage}
          sentinelRef={sentinelRef}
          scrollRootRef={setRootEl} // 내부 스크롤 루트(무한스크롤 root)
          empty={{ message: "등록된 설문이 없습니다." }}
          className="py-2"
        />
      </section>
    </div>
  );
}
