import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "#F7FAFE",
        card: "#FFFFFF",
        muted: "#5E7391",
        accent: "#0084F0",
        brand: {
          primary: "#0084F0",
          dark: "#006FDB",
          soft: "#EAF4FF",
          glow: "rgba(0,132,240,0.12)"
        },
        ink: {
          primary: "#16325C",
          secondary: "#5E7391",
          muted: "#8FA1B8"
        },
        border: {
          soft: "#E5EEF8"
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F7FAFE",
          blue: "#F2F8FF"
        }
      },
      borderRadius: {
        card: "24px",
        button: "18px",
        input: "18px",
        modal: "28px",
        pill: "999px"
      },
      boxShadow: {
        "soft-sm": "0 8px 24px rgba(20, 60, 120, 0.06)",
        "soft-md": "0 16px 40px rgba(20, 60, 120, 0.10)",
        "soft-lg": "0 24px 60px rgba(20, 60, 120, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
