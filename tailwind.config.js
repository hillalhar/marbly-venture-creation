/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // palette taken from the marbly logo, softened for UI surfaces
        cream: "#f5eee8",
        creamsoft: "#faf7f4",
        coral: "#e35f5e",
        coralsoft: "#fbe9e8",
        ink: "#262222",
        mint: "#2fa877",
        mintsoft: "#e4f5ed",
        sun: "#fbedc9",
        lilac: "#eeeaf8",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        brand: ['"Poppins"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.5rem",
      },
      boxShadow: {
        hard: "0 1px 2px rgba(38, 34, 34, 0.06)",
        card: "0 1px 2px rgba(38, 34, 34, 0.04), 0 2px 8px -2px rgba(38, 34, 34, 0.06)",
        soft: "0 12px 32px -12px rgba(38, 34, 34, 0.22)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn .2s ease-out",
        slideUp: "slideUp .22s ease-out",
      },
    },
  },
  plugins: [],
};
