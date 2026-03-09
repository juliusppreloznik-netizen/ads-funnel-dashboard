/** @type {import("tailwindcss").Config} */
// Vision UI Dashboard — Tailwind Design Token Config
// Extracted from: github.com/creativetimofficial/vision-ui-dashboard-react

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── FONTS ──
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Helvetica", "Arial", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "Helvetica", "Arial", "sans-serif"],
      },
      fontWeight: {
        light: "300",
        regular: "400",
        medium: "500",
        bold: "700",
      },

      // ── COLORS (from colors.js) ──
      colors: {
        // Backgrounds
        "vui-body": "#030c1d",
        "vui-page": "#0f1535",
        "vui-sidenav-btn": "#1a1f37",

        // Brand
        "vui-brand": "#0075ff",
        "vui-primary": "#4318ff",
        "vui-primary-focus": "#9f7aea",

        // Text
        "vui-text": "#a0aec0",
        "vui-text-white": "#ffffff",

        // Status
        "vui-success": "#01b574",
        "vui-warning": "#ffb547",
        "vui-error": "#e31a1a",
        "vui-info": "#0075ff",

        // Borders
        "vui-border": "#56577a",

        // Grey scale
        "vui-grey": {
          100: "#edf2f7",
          200: "#e2e8f0",
          300: "#cbd5e0",
          400: "#a0aec0",
          500: "#718096",
          600: "#4a5568",
          700: "#2d3748",
          800: "#1a202a",
          900: "#171923",
        },

        // Chart palette
        "vui-chart": {
          1: "#0075ff",
          2: "#21d4fd",
          3: "#01b574",
          4: "#ffb547",
          5: "#9f7aea",
          6: "#4318ff",
        },
      },

      // ── BORDER RADIUS (from borders.js) ──
      borderRadius: {
        "vui-sm": "8px",
        "vui": "15px",
        "vui-lg": "20px",
        "vui-xl": "24px",
      },

      // ── BOX SHADOWS ──
      boxShadow: {
        "vui-card": "0 20px 27px 0 rgba(0,0,0,0.05)",
        "vui-nav": "inset 0 0 1px 1px rgba(255,255,255,0.9), 0 20px 27px 0 rgba(0,0,0,0.05)",
        "vui-btn": "0 4px 7px -1px rgba(0,0,0,0.11), 0 2px 4px -1px rgba(0,0,0,0.07)",
        "vui-glow": "0 0 20px rgba(0,117,255,0.3)",
        "vui-glow-purple": "0 0 20px rgba(67,24,255,0.3)",
      },

      // ── BACKGROUND IMAGES / GRADIENTS ──
      backgroundImage: {
        "vui-card": "linear-gradient(127.09deg, rgba(6,11,40,0.94) 19.41%, rgba(10,14,35,0.49) 76.65%)",
        "vui-card-dark": "linear-gradient(126.97deg, rgba(6,11,40,0.74) 28.26%, rgba(10,14,35,0.71) 91.2%)",
        "vui-sidenav": "linear-gradient(127.09deg, rgba(6,11,40,0.94) 19.41%, rgba(10,14,35,0.49) 76.65%)",
        "vui-primary-grad": "linear-gradient(97.89deg, #4318ff 70.67%, #9f7aea 108.55%)",
        "vui-info-grad": "linear-gradient(97.89deg, #0075ff 70.67%, #21d4fd 108.55%)",
        "vui-success-grad": "linear-gradient(97.89deg, #01B574 70.67%, #c9fbd5 108.55%)",
        "vui-cover": "linear-gradient(159.02deg, #0f123b 14.25%, #090d2e 56.45%, #020515 86.14%)",
        "vui-logo": "linear-gradient(97.89deg, #ffffff 70.67%, rgba(117,122,140,0) 108.55%)",
      },

      // ── BACKDROP BLUR ──
      backdropBlur: {
        "vui": "120px",
      },

      // ── SPACING ──
      spacing: {
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};
