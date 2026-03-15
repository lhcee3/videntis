import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#111111",
        border: "#1e1e1e",
        "border-hover": "#333333",
        primary: "#f0ede8",
        muted: "#a9a9a2",
        "accent-green": "#00ff87",
        "accent-red": "#ff4444",
        "accent-gold": "#d4a847",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        mono: ["Space Mono", "monospace"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
