export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#141414",
        muted: "#6f6a62",
        line: "#e7e2da",
        paper: "#fbfaf8",
        accent: "#2f5d50",
      },
      boxShadow: {
        soft: "0 20px 50px -35px rgba(20, 20, 20, 0.35)",
      },
    },
  },
  plugins: [],
};
