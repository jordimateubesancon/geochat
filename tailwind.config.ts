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
        geo: {
          50:  '#f0f9e8',
          100: '#d4edbc',
          200: '#a8d87a',
          300: '#7fc44e',
          400: '#5aad35',
          500: '#3d9130',
          600: '#2d7a3a',
          700: '#1f5f2a',
          800: '#164a1f',
          900: '#0d3513',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
