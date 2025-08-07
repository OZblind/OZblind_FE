// tailwind.config.js
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
          "primary-content": "#F5F5F5",

          secondary: "#7B2FF2",
          "secondary-content": "#8E64E5",

          accent: "#C2A9FF",
          "accent-content": "#1A1A1A",

          neutral: "#2C2C2C",
          "neutral-content": "#BBBBBB",

          "base-100": "#121212",
          "base-200": "#1E1E1E",
          "base-300": "#2C2C2C",
          "base-content": "#F5F5F5",

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
          "primary-content": "#1A1A1A",

          secondary: "#5312C6",
          "secondary-content": "#E8DDFD",

          accent: "#9C6BFF",
          "accent-content": "#FFFFFF",

          neutral: "#DCDCDC",
          "neutral-content": "#DCDCDC",

          "base-100": "#F9F9FB",
          "base-200": "#FFFFFF",
          "base-300": "#DCDCDC",
          "base-content": "#1A1A1A",

          info: "#9C6BFF",
          "info-content": "#FFFFFF",

          success: "#00FF00",
          "success-content": "#001600",

          warning: "#00FF00",
          "warning-content": "#001600",

          error: "#FF0000",
          "error-content": "#160000",
        },
      },
    ],
  },
};
