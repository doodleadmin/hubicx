import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "#07111f",
        card: "#0d1c31",
        muted: "#8da2bd",
        accent: "#37d67a"
      }
    }
  },
  plugins: []
};

export default config;
