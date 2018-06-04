module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: 'prettier',
  plugins: ['html'],
  parserOptions: {
    sourceType: 'module',
  },
  parser: 'babel-eslint',
};
