import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        project: ["var(--font-project)", "sans-serif"],
      },
    },
  },
};

export default config;
