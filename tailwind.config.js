import { Config } from 'tailwindcss';

const config = {
  content: [
    "./index.html",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/assets/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#333333", // Primary dark gray for main elements
          hover: "#292929", // Darker gray for hover states
        },
        secondary: {
          DEFAULT: "#F6921E", // Vibrant orange for accents and secondary actions
          hover: "#E6811B", // Slightly muted orange for hover
        },
        active: {
          DEFAULT: "#F6921E", // Orange for active states
        },
        inactive: {
          DEFAULT: "#B5B5B5", // Muted gray for inactive states
        },
        error: "#D32F2F", // Sharp red for error messages
        success: "#4CAF50", // Green for success states
        info: "#1976D2", // Bright blue for informational messages
        background: {
          DEFAULT: "#333333", // Dark gray for the primary background
          accent: "#2B2B2B", // Slightly lighter gray for containers
        },
      },
      gradientColorStops: {
        primary: { start: "#333333", end: "#F6921E" }, // Primary gradient
        secondary: { start: "#333333", end: "#444444" }, // Secondary gradient
      },
    },
  },
  plugins: [],
};

export default config;