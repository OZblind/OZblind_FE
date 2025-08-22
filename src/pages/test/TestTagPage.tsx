// src/pages/test/MockTagPreview.tsx
import { useEffect, useState } from "react";
import AssignedTagList from "@components/tags/AssignedTagList";
import {
  COHORTS,
  POSITIONS,
  buildKey,
  getAssignedTagsByKeyMock,
  profileToTagsMock,
} from "@src/mocks/tags.mock";
import type { Tag } from "@src/types/tag";

export default function MockTagPreview() {
  const [keyInput, setKeyInput] = useState<string>(buildKey("11기", "프론트"));
  const [cohort, setCohort] = useState<(typeof COHORTS)[number]>("11기");
  const [position, setPosition] =
    useState<(typeof POSITIONS)[number]>("프론트");

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 기본 값으로 한번 보여주기
  useEffect(() => {
    void applyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applyKey() {
    setLoading(true);
    setError(null);
    try {
      const result = await getAssignedTagsByKeyMock(keyInput, {
        useParser: true,
      });
      setTags(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "키 파싱 실패");
      setTags([]);
    } finally {
      setLoading(false);
    }
  }

  async function applyProfile() {
    setLoading(true);
    setError(null);
    try {
      const result = profileToTagsMock(cohort, position);
      if (result.length === 0) {
        setError("유효하지 않은 기수/포지션입니다.");
      }
      setTags(result);
      setKeyInput(buildKey(cohort, position));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "프로필 → 태그 변환 실패");
      setTags([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-6">
      <h1 className="text-xl font-bold">Mock Tag Preview</h1>

      {/* A. 키 입력으로 보기 */}
      <section className="space-y-2">
        <h2 className="font-semibold">A) 지정 키로 보기</h2>
        <div className="flex gap-2 items-end">
          <div className="form-control flex-1">
            <label htmlFor="key-input" className="label">
              <span className="label-text">지정 키</span>
            </label>
            <input
              id="key-input"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="input input-bordered w-full"
              placeholder="예: OZ-11-FE"
              // aria-describedby로 보조설명 연결(선택)
              aria-describedby="key-format-help"
            />
            <span id="key-format-help" className="sr-only">
              형식은 OZ-기수번호-직군코드입니다. 예: OZ-11-FE
            </span>
          </div>
          <button
            className="btn btn-primary"
            onClick={applyKey}
            disabled={loading}
          >
            적용
          </button>
        </div>
      </section>

      <section className="space-y-2" aria-labelledby="profile-choice-heading">
        <h2 id="profile-choice-heading" className="font-semibold">
          B) 프로필(기수/포지션) 선택으로 보기
        </h2>

        <div className="flex flex-wrap items-end gap-4">
          <div className="form-control">
            <label htmlFor="cohort-select" className="label">
              <span className="label-text">기수</span>
            </label>
            <select
              id="cohort-select"
              name="cohort"
              className="select select-bordered"
              value={cohort}
              onChange={(e) =>
                setCohort(e.target.value as (typeof COHORTS)[number])
              }
            >
              {COHORTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label htmlFor="position-select" className="label">
              <span className="label-text">포지션</span>
            </label>
            <select
              id="position-select"
              name="position"
              className="select select-bordered"
              value={position}
              onChange={(e) =>
                setPosition(e.target.value as (typeof POSITIONS)[number])
              }
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button className="btn" onClick={applyProfile} disabled={loading}>
            적용
          </button>
        </div>
      </section>

      {/* 결과 표시 */}
      <section className="space-y-2">
        <h2 className="font-semibold">미리보기</h2>
        {loading && <div className="text-sm opacity-70">불러오는 중…</div>}
        {error && <div className="text-sm text-error">{error}</div>}
        <AssignedTagList tags={tags} />
      </section>

      {/* 샘플 키 빠른 실행 */}
      <section className="space-y-2">
        <h2 className="font-semibold">샘플 키</h2>
        <div className="flex flex-wrap gap-2">
          {[
            buildKey("11기", "프론트"),
            buildKey("12기", "백엔드"),
            buildKey("13기", "풀스택"),
            buildKey("14기", "게임"),
            buildKey("15기", "AI"),
          ].map((k) => (
            <button
              key={k}
              className="btn btn-sm"
              onClick={() => {
                setKeyInput(k);
                void applyKey();
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
