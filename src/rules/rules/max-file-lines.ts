/**
 * max-file-lines
 * 
 * 检测文件行数是否超过阈值
 */

import { Rule } from 'eslint';

const DEFAULT_CONFIG = {
  warning: 200,
  error: 300,
  excludePatterns: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.stories.tsx'],
};

interface MaxFileLinesOptions {
  warning?: number;
  error?: number;
  excludePatterns?: string[];
}

function shouldExclude(filename: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(filename);
  });
}

export const maxFileLines: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum file length',
      recommended: 'recommended',
    },
    schema: [
      {
        type: 'object',
        properties: {
          warning: { type: 'number' },
          error: { type: 'number' },
          excludePatterns: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options: MaxFileLinesOptions = context.options[0] || {};
    const warningThreshold = options.warning ?? DEFAULT_CONFIG.warning;
    const errorThreshold = options.error ?? DEFAULT_CONFIG.error;
    const excludePatterns = options.excludePatterns ?? DEFAULT_CONFIG.excludePatterns;

    const filename = context.getFilename();
    
    if (shouldExclude(filename, excludePatterns)) {
      return {};
    }

    return {
      Program(node: any) {
        const sourceCode = context.getSourceCode();
        const lines = sourceCode.getText().split('\n');
        const lineCount = lines.length;

        if (lineCount > errorThreshold) {
          context.report({
            node,
            message: `File has ${lineCount} lines (exceeds ${errorThreshold} line limit). Consider splitting this file.`,
          });
        } else if (lineCount > warningThreshold) {
          context.report({
            node,
            message: `File has ${lineCount} lines (exceeds ${warningThreshold} line warning). Consider splitting this file.`,
          });
        }
      },
    };
  },
};

export default maxFileLines;
