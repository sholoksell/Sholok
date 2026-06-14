/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6c47ff", 50: "#f3f0ff", 100: "#ede8ff", 500: "#6c47ff", 600: "#5835f5", 700: "#4726d9" },
        surface: { DEFAULT: "#0f0f1a", card: "#16162a", border: "#2a2a4a" },
      },
    },
  },
  plugins: [],
};
