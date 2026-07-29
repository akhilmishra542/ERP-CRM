/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2430",
        slate: {
          850: "#1E2733",
        },
        paper: "#F6F5F1",
        brand: {
          50: "#EEF3F1",
          100: "#D7E4DE",
          400: "#4C8C74",
          500: "#2F6B54",
          600: "#25543F",
          700: "#1C3F30",
        },
        rust: "#B5502F",
        amber: "#C08A2E",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
