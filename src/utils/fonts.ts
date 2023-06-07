import { Cabin, Montserrat, Yantramanav } from "next/font/google";

export const cabin = Cabin({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cabin",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const yantramanav = Yantramanav({
  subsets: ["latin"],
  weight: "300",
  display: "swap",
  variable: "--font-yantramanav",
});
