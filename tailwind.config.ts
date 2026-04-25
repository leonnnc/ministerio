import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta principal morado (para admin, formularios)
        primary: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        // Paleta amarillo — base de la identidad visual
        amarillo: {
          50:  "#FFFEF5",  // casi blanco cálido
          100: "#FFFDE7",  // amarillo patito muy suave
          200: "#FFF9C4",  // amarillo claro
          300: "#FFF176",  // amarillo medio
          400: "#FFEE58",  // amarillo vivo
          500: "#FFD600",  // amarillo intenso
          600: "#F9A825",  // amarillo dorado
          700: "#F57F17",  // ámbar oscuro
          800: "#E65100",  // naranja ámbar
          900: "#BF360C",  // ámbar muy oscuro
        },
        // Acento dorado (botones, highlights)
        accent: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
      },
    },
  },
  plugins: [],
};
export default config;
