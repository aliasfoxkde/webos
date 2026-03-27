import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'src/test/'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // ESLint recommended
      ...js.configs.recommended.rules,
      // TypeScript recommended
      ...tseslint.configs.recommended.rules,
      // React hooks
      ...(reactHooks.configs?.recommended?.rules ?? {}),
      // Custom rules
      'no-console': 'warn',
      'no-unused-vars': 'off', // handled by @typescript-eslint
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-refresh/only-export-components': ['warn', {
        allowConstantExport: true,
      }],
    },
  },
);
