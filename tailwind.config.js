// tailwind.config.js
export default {
  darkMode: ['selector', '.tailwind-dark'],
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        'pastel-blue': '#CDD2F6',
        'pastel-green': '#E2FAD4',
        'pastel-peach': '#FFE4B5',
        'pastel-pink': '#FFD6D6',
        'pastel-sky': '#E6F3FF',
      },
    },
  },
  plugins: [],
};
