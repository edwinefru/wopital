module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-restricted-globals': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  }
}; 