/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] }, colors: { ink: "#0a0b10", violet: { DEFAULT: "#7c6cff" }, cyan: { DEFAULT: "#4fd1e8" }, hi: "#ff6b6b", me: "#f5b041", lo: "#4ade80" } } },
  plugins: [],
};
