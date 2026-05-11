import type { Config } from "tailwindcss";

// En Tailwind v4 los colores y temas se configuran en globals.css via @theme inline.
// Este archivo se mantiene solo por compatibilidad con herramientas que lo esperan.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
