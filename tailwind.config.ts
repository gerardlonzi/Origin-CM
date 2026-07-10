import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "origin-navy": "#0B1F3A",
        "origin-blue": "#2563EB",
        "origin-green": "#10B981",
        "origin-orange": "#F59E0B",
        "origin-red": "#EF4444",
        "origin-bg": "#0B0F14",
        "origin-panel": "#141A21",
        "origin-border": "#232B34",
        "origin-muted": "#8B98A5",
      },
    },
  },
  plugins: [],
};
export default config;
