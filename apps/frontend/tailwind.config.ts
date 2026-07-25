import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "var(--color-primary)", foreground: "var(--color-primary-foreground)" },
      },
      cssVariables: {
        "--color-primary": "#2563eb",
        "--color-primary-foreground": "#ffffff",
      },
    },
  },
  plugins: [],
};
export default config;