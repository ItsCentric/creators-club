import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cabin: ["var(--font-cabin)", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        yantramanav: ["var(--font-yantramanav)", "sans-serif"],
      },
      colors: {
        primary: "#141f1d",
        secondary: "#f2f7f6",
        "p-button": "#4a57cf",
        "s-button": "#fcfdfd",
        accent: "#7c4686",
      },
    },
  },
  plugins: [],
} satisfies Config;
