/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./lib/**/*.{js,jsx,ts,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#f9f5e8",
          100: "#f2e7cc",
          200: "#ead9ac"
        },
        gold: {
          500: "#b58c37"
        },
        ink: {
          900: "#1f2321",
          700: "#3c3f3c",
          500: "#656964"
        },
        leaf: {
          700: "#1f7a3f",
          600: "#239149"
        }
      },
      fontFamily: {
        sans: ["Segoe UI", "Tahoma", "sans-serif"],
        brand: ["Palatino Linotype", "Times New Roman", "serif"],
        script: ["Brush Script MT", "Lucida Handwriting", "cursive"]
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": {
            boxShadow: "0 8px 20px rgba(35, 145, 73, 0.3)"
          },
          "50%": {
            boxShadow: "0 12px 26px rgba(35, 145, 73, 0.45)"
          }
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        quickViewIn: {
          from: {
            opacity: "0",
            transform: "translateY(12px) scale(0.94)"
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          }
        }
      },
      animation: {
        "pulse-slow": "pulseSlow 2.8s ease-in-out infinite",
        "fade-in": "fadeIn 0.32s ease-out",
        "quick-view-in": "quickViewIn 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards"
      }
    }
  },
  plugins: []
};
