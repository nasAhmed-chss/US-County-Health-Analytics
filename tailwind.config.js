/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        bg: '#0a0e1a',
        surface: '#111827',
        surface2: '#1c2538',
        border: '#2a3550',
        accent: '#00d4ff',
        accent2: '#ff6b6b',
        accent3: '#ffd93d',
        muted: '#7a8ab0',
      },
    },
  },
  plugins: [],
}
