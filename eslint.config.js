/**
 * NEMT Platform - ESLint Configuration (Flat Config)
 * 代码质量规则配置
 */

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';

export default [
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', 'release/**', '*.js', '*.cjs'],
  },

  // JavaScript/TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
        Array: 'readonly',
        Object: 'readonly',
        String: 'readonly',
        Number: 'readonly',
        Boolean: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        JSON: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        Error: 'readonly',
        TypeError: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // ESLint recommended
      ...js.configs.recommended.rules,

      // Common rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-dupe-else-if': 'error',
      'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'prefer-const': 'warn',
      'no-var': 'error',

      // Forbidden patterns
      'no-implicit-coercion': 'error',
      'no-new-wrappers': 'error',
      'no-proto': 'error',
      'no-throw-literal': 'error',
    },
  },

  // Desktop files - allow console and debugger
  {
    files: ['src/desktop/**/*'],
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
];
