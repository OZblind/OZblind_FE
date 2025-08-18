export async function fetchRandomNickname(): Promise<string> {
  const res = await fetch(
    "https://www.rivestsoft.com/nickname/getRandomNickname.ajax",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // jQuery ajax 기본
      },
      body: new URLSearchParams({ lang: "ko" }),
    }
  );

  if (!res.ok) {
    throw new Error("랜덤 닉네임 API 호출 실패");
  }

  const json = await res.json();
  return json?.data ?? "익명";
}
