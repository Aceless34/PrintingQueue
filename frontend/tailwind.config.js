/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#e2e8f0",
        haze: "#f8fafc",
        accent: "#f97316",
        accentDeep: "#ea580c",
        sea: "#0ea5e9",
      },
      boxShadow: {
        card: "0 10px 30px -18px rgba(15, 23, 42, 0.4)",
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      backgroundImage: {
        glow: "radial-gradient(circle at top left, rgba(249, 115, 22, 0.2), transparent 60%)",
      },
    },
  },
  plugins: [],
};
