/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'serif']
      },
      colors: {
        rosty: '#e4f7f3',
        dawn: '#c8eafb',
        mist: '#f5f8e4',
        peat: '#0e1c2f',
        ember: '#79c5ff',
        sage: '#86d6c2',
        gold: '#ffe78d'
      }
    }
  },
  plugins: []
}
