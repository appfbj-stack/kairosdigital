import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf9e7",
          100: "#faf0c0",
          200: "#f5e07a",
          300: "#ecca3d",
          400: "#D4AF37",
          500: "#c49b2d",
          600: "#a47a1e",
          700: "#7c5a12",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8C958",
          dark: "#A08020",
          muted: "#9B7D20",
        },
        obsidian: {
          DEFAULT: "#0B0B0B",
          50: "#1A1A1A",
          100: "#141414",
          200: "#111111",
          900: "#050505",
        },
        marble: {
          DEFAULT: "#F5F5F2",
          dark: "#E8E8E0",
        },
        stone: {
          DEFAULT: "#8A8A8A",
          light: "#AAAAAA",
          dark: "#666666",
        },
        bronze: {
          DEFAULT: "#8C6239",
          light: "#A5794A",
          dark: "#6B4A27",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        gold: "0 0 20px rgba(212, 175, 55, 0.15)",
        "gold-lg": "0 0 40px rgba(212, 175, 55, 0.2)",
        cinematic: "0 4px 32px rgba(0, 0, 0, 0.6)",
        "cinematic-gold": "0 4px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.1)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #F5C842 50%, #8C6239 100%)",
        "dark-gradient": "linear-gradient(180deg, #0B0B0B 0%, #141414 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
