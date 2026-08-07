/** @type {import('tailwindcss').Config} */

// Tokens dark & bold espelhados de apps/web (src/app/globals.css).
// Mantém paridade visual entre landing web e app mobile.
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#08090c",
        foreground: "#f5f7fb",
        card: {
          DEFAULT: "#0f1116",
          foreground: "#f5f7fb",
        },
        popover: {
          DEFAULT: "#0f1116",
          foreground: "#f5f7fb",
        },
        primary: {
          DEFAULT: "#22d3ee",
          foreground: "#05070a",
        },
        secondary: {
          DEFAULT: "#14171f",
          foreground: "#e2e8f0",
        },
        muted: {
          DEFAULT: "#14171f",
          foreground: "#8891a4",
        },
        accent: {
          DEFAULT: "#0e2530",
          foreground: "#7dd3fc",
        },
        destructive: {
          DEFAULT: "#f43f5e",
          foreground: "#ffffff",
        },
        border: "#1c2030",
        input: "#1c2030",
        ring: "#22d3ee",
        // Extras para gradientes/acentos
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "18": "4.5rem",
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "22px",
        "3xl": "28px",
        "4xl": "32px",
      },
      fontSize: {
        "display-sm": ["32px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display": ["44px", { lineHeight: "46px", letterSpacing: "-0.03em", fontWeight: "900" }],
        "display-lg": ["56px", { lineHeight: "56px", letterSpacing: "-0.035em", fontWeight: "900" }],
      },
    },
  },
  plugins: [],
};
