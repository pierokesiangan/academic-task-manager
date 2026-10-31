import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          border: "var(--surface-border)",
        },
        navy: {
          950: "#0B131D",
          900: "#131E2D",
          800: "#1C2C40",
          700: "#2F4860", // Image: deep navy
          600: "#3B5977",
          500: "#496C8E",
        },
        cobalt: {
          600: "#5A86BF",
          500: "#7DA7D9", // Image: soft cobalt
          400: "#99BCE4",
          300: "#BDD5EF",
          200: "#DDE9F8",
          100: "#EEF4FC",
        },
        ice: {
          300: "#B8DCFD",
          200: "#CDE6FD",
          100: "#DCEEFF", // Image: ice blue
          50:  "#F2F8FF",
        },
        butter: {
          600: "#EAB308",
          500: "#FACC15",
          400: "#FDE047",
          300: "#FEF08A",
          200: "#FEF9C3",
          100: "#FFF7CC", // Image: butter yellow
          50:  "#FFFCF0",
        },
        // Linear-style semantic tokens
        status: {
          todo: "#94A3B8",
          inProgress: "#7DA7D9",
          done: "#34D399",
          overdue: "#F87171",
          urgent: "#FFF7CC",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px)" },
          "40%, 80%": { transform: "translateX(8px)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
