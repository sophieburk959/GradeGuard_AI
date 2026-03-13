import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0f1f3d",
          navySoft: "#1b2d55",
          gold: "#d6a429",
          slate: "#f3f5f9"
        }
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 31, 61, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
