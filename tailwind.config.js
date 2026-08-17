/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        beez: {
          50:  "#E3F2FD",
          100: "#BBDEFB",
          200: "#90CAF9",
          300: "#64B5F6",
          400: "#42A5F5",
          500: "#1E88E5",
          600: "#1565C0",
          700: "#0D47A1",
          800: "#12305E",
          900: "#0F1629",
        },
        gold: {
          50:  "#FFF8E1",
          100: "#FFECB3",
          300: "#FFD54F",
          400: "#FFC107",
          500: "#F9A825",
          600: "#F57F17",
          700: "#E65100",
        },
        ok:       "#2E7D32",
        smart:    "#6A1B9A",
        warn:     "#E65100",
        ink:      "#1A1A2E",
        charcoal: "#212529",
        surface:  "#F4F6F9",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
