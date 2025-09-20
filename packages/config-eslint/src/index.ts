import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importSortPlugin from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';
import type { Linter } from 'eslint';
// Ensure compatibility with ESLint's legacy shareable config loader (CommonJS)
declare const module: any;

/**
 * Shared ESLint configuration (flat config style) for consumers that use ESLint flat config.
 * Exported as a named export to match the requested sample.
 */
export const config: ReadonlyArray<unknown> = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin as unknown as Linter.Plugin,
      prettier: prettierPlugin as unknown as Linter.Plugin,
      'simple-import-sort': importSortPlugin as unknown as Linter.Plugin,
    },
    rules: {
      eqeqeq: ['error', 'smart'],
      'prefer-destructuring': ['error', { array: true, object: true }, { enforceForRenamedProperties: false }],
      'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
      'func-style': ['error', 'expression'],
      curly: ['error', 'multi-line'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
  { ignores: ['dist/**'] },
] as const;

/**
 * Legacy shareable config for .eslintrc.* based projects.
 * Allows extending via "extends": ["@flash-sale/config-eslint"].
 */
const legacyConfig: Linter.Config = {
  root: false,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort', 'turbo'],
  env: { node: true, es2022: true, browser: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist/**'],
  rules: {
    eqeqeq: ['error', 'smart'],
    'prefer-destructuring': ['error', { array: true, object: true }, { enforceForRenamedProperties: false }],
    'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
    'func-style': ['error', 'expression'],
    curly: ['error', 'multi-line'],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'turbo/no-undeclared-env-vars': 'off',
  },
};

export default legacyConfig;

// Provide CommonJS export for ESLint extends resolution
try {
  module.exports = legacyConfig;
} catch {}
