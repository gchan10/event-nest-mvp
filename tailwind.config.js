/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        sand: { 100: '#F3EEE6', 200: '#E9E2D6', 300: '#D9D0C1' },
        sage: {
          50: '#F1F5F1', 100: '#E2EBE3', 200: '#C7D6C9', 400: '#8FAA94',
          500: '#728F78', 600: '#5C7862', 700: '#4A6250', 800: '#3A4D3F',
        },
        ink: { DEFAULT: '#2B2B2A', soft: '#5E5C58', faint: '#8F8B84' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
