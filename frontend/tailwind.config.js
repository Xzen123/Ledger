/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper, #FAFAF8)",
        surface: "var(--color-surface, #FFFFFF)",
        ink: "var(--color-ink, #14171A)",
        mute: "var(--color-mute, #68706B)",
        hairline: "var(--color-hairline, #E5E2DA)",
        indigo: {
          DEFAULT: "var(--color-indigo, #454F78)",
          soft: "var(--color-indigo-soft, #DEE1EC)",
        },
        amber: {
          DEFAULT: "#B0803A",
          soft: "var(--color-amber-soft, #F1E6D2)",
        },
        moss: {
          DEFAULT: "#4B7A63",
          soft: "var(--color-moss-soft, #DCE9E2)",
        },
        clay: {
          DEFAULT: "#B5533C",
          soft: "var(--color-clay-soft, #F3DFD8)",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
