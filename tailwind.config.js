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
          /* Brand colors */
          primary: "#6201E0",
          "primary-focus": "#7B2FF2",
          "primary-content": "#F5F5F5",

          accent: "#C2A9FF",
          "accent-focus": "#C2A9FF",
          "accent-content": "#1A1A1A",

          /* Neutrals */
          neutral: "#2C2C2C",
          "neutral-focus": "#1E1E1E",
          "neutral-content": "#F5F5F5",

          /* Background tiers */
          "base-100": "#121212",
          "base-200": "#1E1E1E",
          "base-300": "#2C2C2C",
          "base-content": "#F5F5F5",

          /* Feedback */
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
          /* Brand colors */
          primary: "#6201E0",
          "primary-focus": "#5312C6",
          "primary-content": "#F5F5F5",

          accent: "#9C6BFF",
          "accent-focus": "#9C6BFF",
          "accent-content": "#FFFFFF",

          /* Neutrals */
          neutral: "#DCDCDC",
          "neutral-focus": "#F9F9FB",
          "neutral-content": "#1A1A1A",

          /* Background tiers */
          "base-100": "#F9F9FB",
          "base-200": "#FFFFFF",
          "base-300": "#DCDCDC",
          "base-content": "#1A1A1A",

          /* Feedback */
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
