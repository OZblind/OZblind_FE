// src/utils/google.ts
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";
let gisLoader: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisLoader) return gisLoader;

  gisLoader = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () =>
      reject(new Error("Failed to load Google Identity Services script"));
    document.head.appendChild(s);
  });
  return gisLoader;
}

// 간단한 오버레이 + 구글 버튼 호스트
function mountOverlay(): {
  root: HTMLDivElement;
  btnHost: HTMLDivElement;
  destroy: () => void;
} {
  const root = document.createElement("div");
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
  } as CSSStyleDeclaration);

  const card = document.createElement("div");
  Object.assign(card.style, {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    minWidth: "320px",
    boxShadow: "0 10px 20px rgba(0,0,0,.15)",
    textAlign: "center",
  } as CSSStyleDeclaration);

  const title = document.createElement("div");
  title.textContent = "Google 계정으로 계속하기";
  Object.assign(title.style, { fontSize: "16px", marginBottom: "12px" });

  const btnHost = document.createElement("div");
  btnHost.id = "google_btn_host";

  const hint = document.createElement("div");
  hint.textContent = "팝업이 차단되면 주소창 왼쪽 아이콘에서 허용해 주세요.";
  Object.assign(hint.style, {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "10px",
  });

  card.appendChild(title);
  card.appendChild(btnHost);
  card.appendChild(hint);
  root.appendChild(card);
  document.body.appendChild(root);

  return { root, btnHost, destroy: () => root.remove() };
}

/** 팝업 버튼 전용: FedCM/OneTap 사용 안 함 → id_token 반환 */
export async function getGoogleIdToken(): Promise<string> {
  await loadGisScript();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Missing VITE_GOOGLE_CLIENT_ID");

  // FedCM/오토셀렉트/원탭 비활성화
  window.google!.accounts.id.initialize({
    client_id: clientId,
    callback: (resp: { credential?: string }) => {
      if (resp?.credential) resolver(resp.credential);
    },
    auto_select: false,
    use_fedcm_for_prompt: false,
    cancel_on_tap_outside: true,
    context: "signin",
  });
  window.google!.accounts.id.disableAutoSelect?.();

  const { btnHost, destroy } = mountOverlay();

  // 버튼 렌더링(클릭 시 팝업 → credential 콜백으로 id_token 수신)
  window.google!.accounts.id.renderButton(btnHost, {
    type: "standard",
    theme: "filled_blue",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    logo_alignment: "left",
  });

  // Promise 래핑
  let resolved = false;
  let resolver!: (v: string) => void;
  let rejecter!: (e: Error) => void;
  const p = new Promise<string>((resolve, reject) => {
    resolver = (v) => {
      if (resolved) return;
      resolved = true;
      destroy();
      resolve(v);
    };
    rejecter = (e) => {
      if (resolved) return;
      resolved = true;
      destroy();
      reject(e);
    };
  });

  // 안전장치: 2분 내 미클릭/미응답 시 타임아웃
  const t = setTimeout(
    () => rejecter(new Error("Google sign-in timed out")),
    120_000
  );
  return p.finally(() => clearTimeout(t));
}
