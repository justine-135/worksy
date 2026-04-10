import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // IMPORTANT
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
};

export default config;
