import type { Config } from "tailwindcss";
import { animations, animationConfig } from "./src/lib/tailwind/animations";
import { colors } from "./src/lib/tailwind/colors";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors,
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: animations,
      animation: animationConfig,
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;