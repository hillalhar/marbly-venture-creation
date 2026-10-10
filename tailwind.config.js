/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fbeee6",
        creamsoft: "#fdf4ee",
        coral: "#f26d6d",
        coralsoft: "#f5857f",
        ink: "#1a1413",
        mint: "#34c38f",
        mintsoft: "#a7e8cf",
        sun: "#f6c343",
        lilac: "#b9a7f0",
      },
      fontFamily: {
        display: ['"Baloo 2"', "system-ui", "sans-serif"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.75rem",
        xl3: "2.25rem",
      },
      boxShadow: {
        hard: "0 6px 0 0 #1a1413",
        card: "0 4px 0 0 #1a1413",
      },
    },
  },
  plugins: [],
};
