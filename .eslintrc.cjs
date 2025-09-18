module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: { node: true, es2022: true, browser: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', project: false },
  ignorePatterns: ['dist', 'build', 'node_modules', '.turbo'],
  rules: {
    // Enforce arrow functions everywhere (no function declarations/expressions)
    'func-style': ['error', 'expression'],
    'no-restricted-syntax': [
      'error',
      { selector: 'FunctionDeclaration', message: 'Use arrow functions only.' },
      { selector: 'FunctionExpression', message: 'Use arrow functions only.' }
    ],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
    'arrow-body-style': ['error', 'as-needed'],
    'no-var': 'error',
    'prefer-const': 'error'
  }
};
