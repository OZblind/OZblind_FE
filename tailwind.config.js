/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        oz_dark: {
          primary: "#6201E0",
          "primary-content": "#E1DBFF",

          secondary: "#8E64E5",
          "secondary-content": "#1A0D2E",

          accent: "#C2A9FF",
          "accent-content": "#1B102B",

          neutral: "#1E1E1E",
          "neutral-content": "#F5F5F5",

          "base-100": "#121212",
          "base-200": "#1A1A1A",
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
          "primary-content": "#FFFFFF",

          secondary: "#E8DDFD",
          "secondary-content": "#1A1A1A",

          accent: "#9C6BFF",
          "accent-content": "#FFFFFF",

          neutral: "#FFFFFF",
          "neutral-content": "#1A1A1A",

          "base-100": "#F9F9FB",
          "base-200": "#F0F0F0",
          "base-300": "#DCDCDC",
          "base-content": "#1A1A1A",

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
