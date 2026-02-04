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
        rosty: '#F6F1F3',
        dawn: '#FDEFF5',
        mist: '#EFF0F6',
        peat: '#1B223A',
        ember: '#F25D94',
        sage: '#A8D3B0',
        gold: '#FFC857'
      }
    }
  },
  plugins: []
}
