import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  // Instead of ./sanity/**/*.js, it should be more specific:
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    // If you need Sanity files, be more specific:
    "./sanity/schemas/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100ch", // Increase article width
            color: "rgb(55 65 81)", // gray-700
            h1: {
              fontWeight: "800",
              color: "rgb(17 24 39)", // gray-900
            },
            h2: {
              fontWeight: "700",
              color: "rgb(17 24 39)", // gray-900
            },
            h3: {
              fontWeight: "600",
              color: "rgb(17 24 39)", // gray-900
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            code: {
              color: "rgb(31 41 55)", // gray-800
              backgroundColor: "rgb(243 244 246)", // gray-100
              borderRadius: "0.25rem",
              padding: "0.2rem 0.4rem",
            },
          },
        },
      },
      boxShadow: {
        layer: "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
      },
      colors: {
        black: "#0d0e12",
        white: "#fff",
        cyan: {
          50: "#e7fefe",
          100: "#c5fcfc",
          200: "#96f8f8",
          300: "#62efef",
          400: "#18e2e2",
          500: "#04b8be",
          600: "#037782",
          700: "#024950",
          800: "#042f34",
          900: "#072227",
          950: "#0d181c",
        },
        gray: {
          50: "#f6f6f8",
          100: "#eeeef1",
          200: "#e3e4e8",
          300: "#bbbdc9",
          400: "#9499ad",
          500: "#727892",
          600: "#515870",
          700: "#383d51",
          800: "#252837",
          900: "#1b1d27",
          950: "#13141b",
        },
        red: {
          50: "#fff6f5",
          100: "#ffe7e5",
          200: "#ffdedc",
          300: "#fdada5",
          400: "#f77769",
          500: "#ef4434",
          600: "#cc2819",
          700: "#8b2018",
          800: "#4d1714",
          900: "#321615",
          950: "#1e1011",
        },
        orange: {
          50: "#fcf1e8",
          100: "#f9e3d2",
          200: "#f4c7a6",
          300: "#efab7a",
          400: "#ea8f4e",
          500: "#e57322",
          600: "#ba5f1e",
          700: "#8f4b1b",
          800: "#653818",
          900: "#3a2415",
          950: "#251a13",
        },
        yellow: {
          50: "#fefae1",
          100: "#fcf3bb",
          200: "#f9e994",
          300: "#f7d455",
          400: "#f9bc15",
          500: "#d28a04",
          600: "#965908",
          700: "#653a0b",
          800: "#3b220c",
          900: "#271a11",
          950: "#181410",
        },
        green: {
          50: "#e7f9ed",
          100: "#d0f4dc",
          200: "#a1eaba",
          300: "#72e097",
          400: "#43d675",
          500: "#3ab564",
          600: "#329454",
          700: "#297343",
          800: "#215233",
          900: "#183122",
          950: "#14211a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [typography],
};

export default config;
