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

          // Primary Hover / Light
          secondary: "#7B2FF2", // Primary Hover
          "secondary-content": "#8E64E5", // Primary Light

          accent: "#C2A9FF",
          "accent-content": "#1A1A1A",

          // Text / Divider / BG
          neutral: "#2C2C2C", // Divider
          "neutral-content": "#BBBBBB", // Text Dim

          "base-100": "#121212", // Background
          "base-200": "#1E1E1E", // Container
          "base-300": "#2C2C2C",
          "base-content": "#F5F5F5", // Text Primary

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

          secondary: "#5312C6", // Primary Hover
          "secondary-content": "#E8DDFD", // Primary Light

          accent: "#9C6BFF",
          "accent-content": "#FFFFFF",

          // Text / Divider / BG
          neutral: "#DCDCDC", // Divider
          "neutral-content": "#1A1A1A",

          "base-100": "#F9F9FB", // Background
          "base-200": "#FFFFFF", // Container
          "base-300": "#DCDCDC",
          "base-content": "#1A1A1A", // Text Primary

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
