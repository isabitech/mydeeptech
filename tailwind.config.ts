import { Config } from 'tailwindcss';

const config: Config = {
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
          DEFAULT: "#4CAF50", // Green for primary buttons
          hover: "#45A049", // Darker green for hover
        },
        secondary: {
          DEFAULT: "#2196F3", // Blue for secondary buttons
          hover: "#1976D2", // Darker blue for hover
        },
        active: {
          DEFAULT: "#FFD700", // Gold for active state
        },
        inactive: {
          DEFAULT: "#A9A9A9", // Gray for inactive state
        },
        error: "#FF5722", // Red-orange for errors
        success: "#4CAF50", // Green for success
        info: "#00BCD4", // Cyan for info
        background: {
          DEFAULT: "#1f1f2e", // Dark navy background
          accent: "#252539", // Accent container background
        },
      },
      gradientColorStops: {
        primary: { start: "#1f1f2e", end: "#313159" }, // Gradient for primary background
        secondary: { start: "#1f1f2e", end: "#2a2a4a" }, // Secondary section gradient
      },
    },
  },
  plugins: [],
};

export default config;
