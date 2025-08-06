/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Pretendard", "sans-serif", "system-ui"],
    },
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        oz_dark: {
          primary: "#6201E0",
          "primary-hover": "#7B2FF2",
          "primary-light": "#8E64E5",
          accent: "#C2A9FF",
          container: "#1E1E1E",
          background: "#121212",
          border: "#2C2C2C",

          "text-primary": "#F5F5F5",
          "text-dim": "#BBBBBB",
          "text-reverse": "#1A1A1A",

          info: "#9C6BFF",
          "info-content": "#1A0F2F",
          success: "#00FF00",
          "success-content": "#001600",
          warning: "#FFCC00",
          "warning-content": "#332B00",
          error: "#FF0000",
          "error-content": "#160000",
        },
      },
      {
        oz_light: {
          primary: "#6201E0",
          "primary-hover": "#5312C6",
          "primary-light": "#E8DDFD",
          accent: "#9C6BFF",
          container: "#FFFFFF",
          background: "#F9F9FB",
          border: "#DCDCDC",

          "text-primary": "#1A1A1A",
          "text-dim": "#666666",
          "text-reverse": "#F5F5F5",

          info: "#9C6BFF",
          "info-content": "#FFFFFF",
          success: "#00FF00",
          "success-content": "#001600",
          warning: "#FFCC00",
          "warning-content": "#332B00",
          error: "#FF0000",
          "error-content": "#160000",
        },
      },
    ],
  },
};
