/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#000000',
      },
      keyframes: {
        moveBackground: {
          from: { backgroundPosition: '0% 0%' },
          to: { backgroundPosition: '0% -1000%' },
        },
      },
      animation: {
        'move-background': 'moveBackground 60s linear infinite',
      },
    },
  },
  plugins: [],
}
