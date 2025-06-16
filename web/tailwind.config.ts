import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#0A0A0A',
        offBlack: '#171717',
        gray3: '#6D6D6D',
        gray2: '#CCCCCC',
        gray1: '#DDDDDD',
        offWhite: '#F7F7F7',
        white: '#FDFDFD',
        elataGreen: '#607274',
        accentRed: '#FF797B',
        offCream: '#F8F5EE',
        cream1: '#F3EEE2',
        cream2: '#E5E0D3',
      },
      fontFamily: {
        'montserrat': ['var(--font-montserrat)'],
        'sf-pro': ['var(--font-sf-pro)'],
      },
      borderRadius: {
        'xl': '1.25rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
