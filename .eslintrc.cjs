/**
 * NEMT Platform - ESLint Configuration
 * 代码质量规则配置
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // TypeScript 规则
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],

    // React 规则
    'react/prop-types': 'error',
    'react/require-default-props': ['error', { functions: 'ignore' }],
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // 通用规则
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-dupe-else-if': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    'no-unused-vars': 'off',
    'prefer-const': 'warn',
    'no-var': 'error',

    // Import 规则
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/stores/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/components/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/hooks/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/presets/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/types/**',
            group: 'internal',
            position: 'after',
          },
        ],
        alphabetize: { order: 'asc' },
        'newlines-between': 'always',
      },
    ],
    'import/no-cycle': 'error',
    'import/no-useless-path-aliases': 'error',

    // 禁止的代码模式
    'no-implicit-coercion': 'error',
    'no-new-wrappers': 'error',
    'no-proto': 'error',
    'no-return-await': 'off',
    'no-throw-literal': 'error',
  },
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
        'react-hooks/exhaustive-deps': 'error',
      },
    },
    {
      files: ['src/desktop/**/*'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
