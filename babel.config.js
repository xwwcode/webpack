//将 ES6+ 语法转译成 ES5 
module.exports = {
  presets: [['@babel/preset-env']],
  plugins: ['@babel/plugin-transform-runtime']
}