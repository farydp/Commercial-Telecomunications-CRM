import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0e1726",
        sand: "#f4efe8",
        coral: "#d9785f",
        teal: "#1d7a75",
        mist: "#d8e5e1"
      },
      boxShadow: {
        card: "0 18px 40px rgba(14, 23, 38, 0.08)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(217, 120, 95, 0.20), transparent 35%), radial-gradient(circle at top right, rgba(29, 122, 117, 0.16), transparent 28%), linear-gradient(135deg, #f8f4ef 0%, #eef5f3 100%)"
      }
    }
  },
  plugins: []
};

export default config;


