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
        primary: {
          100: "#feddcd",
          200: "#fdbc9b",
          300: "#fd9a68",
          400: "#fc7836",
          500: "#fc8c54",
          600: "#fb5604",
          700: "#c94503",
          800: "#973402",
          900: "#642302",
        },
        secondary: {
          100: "#fecdd5",
          200: "#fd9bab",
          300: "#fc6982",
          400: "#fb3758",
          500: "#fc4c69",
          600: "#fa052e",
          700: "#c80425",
          800: "#96031c",
          900: "#640212",
        },
        accent: {
          100: "#d7eaf4",
          200: "#afd6e9",
          300: "#87c1de",
          400: "#5facd3",
          500: "#2D7CA4",
          600: "#3798c8",
          700: "#2c79a0",
          800: "#215b78",
          900: "#163d50",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
