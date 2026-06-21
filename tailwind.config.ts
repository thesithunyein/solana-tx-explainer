import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "sol-green": "#14F195",
        "sol-purple": "#9945FF",
        "sol-dark": "#0B0F19",
        "sol-card": "#131722",
        "sol-border": "#1E2A3A",
      },
    },
  },
  plugins: [],
};

export default config;
