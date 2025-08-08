import { OAUTH_START_URL, OAUTH_REDIRECT_URI } from "../constants/oauth";
import { logoColor } from "../assets";

export default function LandingPage() {
  const query = new URLSearchParams({
    redirect_uri: OAUTH_REDIRECT_URI,
  }).toString();
  const oauthStart = `${OAUTH_START_URL}?${query}`;

  const handleBeforeRedirect = () => {
    // 로그인 전 복귀 경로 저장
    localStorage.setItem(
      "postLoginPath",
      window.location.pathname + window.location.search
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="mb-6">
        <img src={logoColor} alt="로고" className="w-40 h-auto" />
      </h1>

      <a
        href={oauthStart}
        onClick={handleBeforeRedirect}
        className="btn btn-accent"
      >
        Continue with Google
      </a>
    </div>
  );
}
