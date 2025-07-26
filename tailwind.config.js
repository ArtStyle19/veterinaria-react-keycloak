// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Essential for Tailwind to scan your components
  ],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 4px 30px rgba(0,0,0,0.15)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      colors: {
        softGreen: '#A9C3B8',
        lightGray: '#EDEDEF',
        darkBlue: '#252F48',
        roseRed: '#D16D79',
        teal: '#1BBCB6',
      },
    },
  },
  plugins: [], // No plugins needed here for @tailwindcss/postcss setup unless you have custom Tailwind plugins
};
