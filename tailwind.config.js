/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chabot: {
          gold: '#C5A572',
        },
      },
      fontFamily: {
        serif: ['Trajan Pro', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};