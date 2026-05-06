/**
 * ESLint Configuration for Refactor Rules
 * 
 * 使用方法:
 *   npx eslint --config eslint.config.refactor.js src/
 *   npx eslint --config eslint.config.refactor.js src/components/portfolio/
 * 
 * 在 package.json 中添加:
 *   "refactor:check": "eslint --config eslint.config.refactor.js src/",
 *   "refactor:check:fix": "eslint --config eslint.config.refactor.js src/ --fix"
 */

const path = require('path');

// 加载规则配置
const rulesConfig = require('./src/rules/refactor-rules.json');

const refactorRules = {
  // 文件行数限制
  'max-file-lines': ['warn', {
    warning: rulesConfig.rules.fileLines.warning,
    error: rulesConfig.rules.fileLines.error,
    excludePatterns: rulesConfig.rules.fileLines.excludePatterns,
  }],

  // 函数行数限制
  'max-function-lines': ['warn', {
    warning: rulesConfig.rules.functionLines.warning,
    error: rulesConfig.rules.functionLines.error,
    excludeNames: rulesConfig.rules.functionLines.excludeNames,
  }],

  // 嵌套深度限制
  'max-nesting-depth': ['warn', {
    warning: rulesConfig.rules.nestingDepth.warning,
    error: rulesConfig.rules.nestingDepth.error,
  }],

  // 参数数量限制
  'max-params': ['warn', {
    warning: rulesConfig.rules.maxParams.warning,
    error: rulesConfig.rules.maxParams.error,
  }],

  // 重复代码检测
  'no-duplicate-code': ['warn', {
    threshold: rulesConfig.rules.duplicateCode.threshold,
    minTokens: rulesConfig.rules.duplicateCode.minTokens,
  }],

  // 提取机会提示
  'extract-opportunity': ['warn', {
    repeatedPattern: rulesConfig.extractOpportunities.repeatedPattern,
    largeSwitch: rulesConfig.extractOpportunities.largeSwitch,
    complexCondition: rulesConfig.extractOpportunities.complexCondition,
  }],

  // 圈复杂度警告
  'complexity-warning': ['warn', {
    warning: 10,
    error: 15,
  }],
};

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  
  env: {
    browser: true,
    es2022: true,
    node: true,
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  rules: refactorRules,

  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.stories.tsx'],
      rules: {
        // 测试文件和故事书文件可以忽略一些规则
        'max-file-lines': 'off',
        'max-function-lines': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],

  reportUnusedDisableDirectives: true,
};
