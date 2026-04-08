/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        surface: '#f8fafc',
        accent: '#0f766e',
        accentSoft: '#ccfbf1',
      },
      boxShadow: {
        panel: '0 12px 30px -16px rgba(2, 6, 23, 0.25)',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui'],
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
