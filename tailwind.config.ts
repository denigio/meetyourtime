import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f5f4",
          900: "#0a0a0a",
          950: "#050505",
        },
        verdict: {
          replace: "#ef4444",
          fix: "#eab308",
          keep: "#22c55e",
        },
        brand: {
          primary: "#2563EB",
          secondary: "#0F172A",
          tertiary: "#BC4800",
          neutral: "#757681",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
        modal: "16px",
        pill: "9999px",
      },
      letterSpacing: {
        display: "-0.02em",
        body: "-0.01em",
      },
      lineHeight: {
        display: "1.1",
        ui: "1.4",
      },
    },
  },
  plugins: [],
};

export default config;
