// 실제는 GIS(Google Identity Services)로 교체 예정.
// 지금은 테스트용: 프롬프트로 id_token 입력 받아 백엔드 플로우만 검증.
export async function getGoogleIdToken(): Promise<string> {
  const manual = window.prompt("테스트용 Google id_token 입력");
  if (!manual) throw new Error("Google id_token 취소");
  return manual.trim();
}
