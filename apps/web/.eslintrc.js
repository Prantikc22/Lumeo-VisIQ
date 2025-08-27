module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals'
  ],
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  ignorePatterns: ['.next/', 'node_modules/'],
  rules: {
    // Add custom rules here
  }
};
