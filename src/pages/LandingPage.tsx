import { OAUTH_START_URL, OAUTH_REDIRECT_URI } from "../constants/oauth";
import { logoColor } from "../assets";

export default function LandingPage() {
  const query = new URLSearchParams({
    redirect_uri: OAUTH_REDIRECT_URI,
    // state는 (고정 분기 전제면) 프론트에서 생성/보관하지 않음.
  }).toString();

  const oauthStart = `${OAUTH_START_URL}?${query}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="mb-6">
        <img src={logoColor} alt="로고" className="w-40 h-auto" />
      </h1>

      <a href={oauthStart} className="btn btn-accent">
        Continue with Google
      </a>

      <p className="mt-3 text-sm opacity-70">
        구글로 이동하여 로그인합니다. 창이 전환될 수 있어요.
      </p>
    </div>
  );
}
