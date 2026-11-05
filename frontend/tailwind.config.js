/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F5EE',
        accent: {
          DEFAULT: '#E25C1D',
          hover: '#C74E13',
          tint: '#FBECE3',
        },
        ink: '#262320',
        muted: '#7C7670',
        line: '#EAE6DF',
      },
    },
  },
  plugins: [],
}
