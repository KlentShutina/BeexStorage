/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind dark: variants now activate when [data-dark="true"] is set on <html>
  darkMode: ['selector', '[data-dark="true"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // BeexStorage website palette
        beex: {
          50: "#FFF8E1",
          100: "#FFECB3",
          200: "#FFE082",
          300: "#FFD54F",
          400: "#FFCA40",
          500: "#FDB316",
          600: "#FFA000",
          700: "#FF8F00",
          800: "#FF6F00",
          ink: "#1C1C1E",
        },
        // Semantic text colors that flip automatically via CSS variables.
        // Use these instead of text-beex-ink / text-zinc-* in app UI.
        ink: {
          DEFAULT: "var(--c-text)",
          muted: "var(--c-text-muted)",
          dim: "var(--c-text-dim)",
        },
        surface: {
          DEFAULT: "var(--c-surface)",
          alt: "var(--c-surface-alt)",
        },
        line: "var(--c-border)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
