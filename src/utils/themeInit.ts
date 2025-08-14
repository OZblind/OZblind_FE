// 웹 페이지 첫 로드 시 테마 초기화
(function () {
  try {
    let theme = localStorage.getItem("theme");
    if (!theme) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      theme = prefersDark ? "oz_dark" : "oz_light";
    }
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    console.error("Failed to initialize theme", e);
  }
})();
