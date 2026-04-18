/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#fef9c3',100:'#fef08a',400:'#facc15',500:'#eab308',600:'#ca8a04',700:'#a16207' },
      },
    },
  },
  plugins: [],
}
