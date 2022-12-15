/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/*.pug'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
