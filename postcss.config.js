const tailwindcss = require('tailwindcss')
const postcssFocusVisible = require('postcss-focus-visible')
module.exports = {
  plugins: [
    tailwindcss('./tailwind.config.js'),
    postcssFocusVisible(),
    require('autoprefixer'),
    require('postcss-nested'),
  ],
}
