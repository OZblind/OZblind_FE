import { EASTER_EGG_NICKNAMES } from "@src/constants/easterEggNicknames";

export async function fetchRandomNickname(): Promise<string> {
  // 1. 기본 랜덤 닉네임 API 호출
  try {
    const res = await fetch(
      "https://www.rivestsoft.com/nickname/getRandomNickname.ajax",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ lang: "ko" }),
      }
    );

    if (!res.ok) throw new Error("랜덤 닉네임 API 호출 실패");
    const json = await res.json();
    const apiNickname = json?.data ?? "익명";

    // 2. 확률적으로 이스터에그 발동
    const chance = Math.random();
    if (chance < 0.05) {
      // 5% 확률로 발동
      const special =
        EASTER_EGG_NICKNAMES[
          Math.floor(Math.random() * EASTER_EGG_NICKNAMES.length)
        ];
      return special;
    }

    return apiNickname;
  } catch {
    // API 실패 시에도 이스터에그 닉네임으로 대체 가능
    return (
      EASTER_EGG_NICKNAMES[
        Math.floor(Math.random() * EASTER_EGG_NICKNAMES.length)
      ] ?? "익명"
    );
  }
}
