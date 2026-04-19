import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f0f",
        surface: "#1a1a1a",
        "surface-2": "#252525",
        border: "#333333",
        accent: "#6366f1",
        "accent-hover": "#818cf8",
        "text-primary": "#f5f5f5",
        "text-muted": "#a1a1a1",
      },
    },
  },
  plugins: [],
} satisfies Config;
