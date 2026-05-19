import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette type Eurecia : bleu marine sombre + bleu vif
        brand: {
          50:  '#eef4ff',
          100: '#dbe7fe',
          200: '#bfd3fd',
          300: '#94b4fb',
          400: '#618bf6',
          500: '#3a64ef',
          600: '#2447df',
          700: '#1d39c4',
          800: '#1d319f',
          900: '#1e2f7e',
          950: '#161e4a',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
