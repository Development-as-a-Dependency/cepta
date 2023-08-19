/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/*.pug', './views/**/*.pug'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        'brand-primary': '#F03460',
      },
    },
  },
  plugins: [],
};
