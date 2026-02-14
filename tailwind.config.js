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
        rosty: '#e0eff6',
        dawn: '#c7dbe6',
        mist: '#f5f7f9',
        peat: '#0c1c2a',
        ember: '#8fbfd5',
        sage: '#8fc3b5',
        gold: '#d9e8c9'
      }
    }
  },
  plugins: []
}
