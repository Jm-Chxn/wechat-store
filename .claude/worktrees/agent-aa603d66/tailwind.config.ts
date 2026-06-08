import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans-sc)", "system-ui", "sans-serif"],
        zh: ["var(--font-noto-sans-sc)", "var(--font-inter)", "sans-serif"],
      },
      colors: {
        // brand tokens
        bg: "#FAF8F3",
        surface: "#FFFFFF",
        ink: "#2C2C2C",
        primary: {
          DEFAULT: "#D94F2B",
          hover: "#B94023",
          foreground: "#FFFFFF",
        },
        gold: "#C8932E",
        amber: {
          soft: "#E8B14B",
        },
        green: {
          soft: "#A8C29B",
        },
        // shadcn-compatible tokens (mapped to brand)
        border: "hsl(30 15% 88%)",
        input: "hsl(30 15% 88%)",
        ring: "#D94F2B",
        background: "#FAF8F3",
        foreground: "#2C2C2C",
        secondary: {
          DEFAULT: "#F1ECE2",
          foreground: "#2C2C2C",
        },
        muted: {
          DEFAULT: "#F1ECE2",
          foreground: "#6B6B6B",
        },
        accent: {
          DEFAULT: "#F1ECE2",
          foreground: "#2C2C2C",
        },
        destructive: {
          DEFAULT: "#C0392B",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C2C2C",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C2C2C",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 4px 12px -4px rgba(44,44,44,0.08)",
        lift: "0 12px 24px -10px rgba(217,79,43,0.18)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
