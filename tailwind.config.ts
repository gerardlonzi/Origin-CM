import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B3D2E",
        "navy-light": "#146C4E",
        accent: "#007A5E",
        "bg-app": "#FFFFFF",
        "bg-soft": "#F6F8F7",
        border: "#E2E8E5",
        muted: "#5B6B63",
        gold: "#FCD116",
        "flag-red": "#CE1126",
      },
    },
  },
  plugins: [],
};
export default config;
